import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FABRICS,
  MEASURES_FEMME,
  MEASURES_HOMME,
  fmtPrice,
} from "../data/catalog";
import type { Product as UiProduct } from "../data/catalog";
import { useStore } from "../context/StoreContext";
import { listProducts, uploadFabricPhoto, ABMCYApiError } from "../services/abmcy";
import { mapProducts } from "../lib/mapProduct";
import { MaskLines, Reveal } from "../components/Reveal";
import {
  IconArrow,
  IconBag,
  IconCheck,
  IconNeedle,
  IconPhone,
  IconRuler,
  IconSwatch,
  IconUpload,
} from "../components/Icons";

const STEPS = [
  { n: 1, label: "Vos coordonnées", icon: <IconPhone size={17} /> },
  { n: 2, label: "Vos mesures", icon: <IconRuler size={17} /> },
  { n: 3, label: "Votre tissu", icon: <IconSwatch size={17} /> },
  { n: 4, label: "Récapitulatif", icon: <IconCheck size={17} /> },
];

const DIAGRAM: Record<"femme" | "homme", { n: number; d: string }[]> = {
  femme: [
    { n: 1, d: "M62 88 H138" },
    { n: 2, d: "M70 122 H130" },
    { n: 3, d: "M62 166 H138" },
    { n: 4, d: "M58 56 H142" },
    { n: 5, d: "M152 62 V152" },
    { n: 6, d: "M176 48 V286" },
  ],
  homme: [
    { n: 1, d: "M62 88 H138" },
    { n: 2, d: "M70 122 H130" },
    { n: 3, d: "M62 166 H138" },
    { n: 4, d: "M58 56 H142" },
    { n: 5, d: "M152 62 V152" },
    { n: 6, d: "M74 172 V286" },
    { n: 7, d: "M176 48 V286" },
  ],
};

export default function SurMesure() {
  const [params] = useSearchParams();
  const { addToCart, toast } = useStore();

  const [products, setProducts] = useState<UiProduct[]>([]);
  useEffect(() => {
    let cancelled = false;
    listProducts()
      .then((list) => {
        if (!cancelled) setProducts(mapProducts(list));
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const forModel = useMemo(
    () => products.find((p) => p.id === params.get("modele")) ?? null,
    [products, params]
  );

  const [step, setStep] = useState(1);
  const [gender, setGender] = useState<"femme" | "homme">(forModel?.gender ?? "femme");
  const [contact, setContact] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    details: forModel
      ? `Personnalisation du modèle ${forModel.name} (${forModel.sub}). `
      : "",
  });
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [activeM, setActiveM] = useState<string | null>(null);
  const [fabricSource, setFabricSource] = useState<"maison" | "envoi" | "conseil">("maison");
  const [fabricId, setFabricId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fabricFile, setFabricFile] = useState<File | null>(null);
  const [fabricUploadUrl, setFabricUploadUrl] = useState<string | null>(null);
  const [fabricUploading, setFabricUploading] = useState(false);
  const [fabricUploadError, setFabricUploadError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fields = gender === "femme" ? MEASURES_FEMME : MEASURES_HOMME;
  const fabric = FABRICS.find((f) => f.id === fabricId) ?? null;
  const basePrice = forModel ? forModel.price : 40000;
  const total = basePrice + (fabricSource === "maison" && fabric ? fabric.extra : 0);
  const filledMeasures = fields.filter((f) => (measurements[f.key] ?? "").trim() !== "");

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setFabricFile(f);
    setFabricUploadUrl(null);
    setFabricUploadError(null);
    const reader = new FileReader();
    reader.onload = () => setFilePreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const next = async () => {
    setError(null);
    if (step === 1) {
      if (!contact.name.trim() || !contact.phone.trim() || !contact.address.trim()) {
        setError("Merci d'indiquer au minimum votre nom, votre téléphone et votre adresse de livraison.");
        return;
      }
    }
    if (step === 3) {
      if (fabricSource === "maison" && !fabricId) {
        setError("Sélectionnez un tissu dans la galerie de la maison.");
        return;
      }
      if (fabricSource === "envoi" && !fileName) {
        setError("Téléchargez une photo de votre tissu pour continuer.");
        return;
      }
      // Upload réel de la photo du tissu vers R2 avant de continuer
      if (fabricSource === "envoi" && fabricFile && !fabricUploadUrl) {
        setFabricUploading(true);
        setFabricUploadError(null);
        try {
          const result = await uploadFabricPhoto(fabricFile);
          setFabricUploadUrl(result.url);
        } catch (e) {
          setFabricUploading(false);
          setFabricUploadError(
            e instanceof ABMCYApiError
              ? e.message
              : "Impossible d'envoyer la photo du tissu pour le moment."
          );
          return;
        }
        setFabricUploading(false);
      }
    }
    setStep(Math.min(4, step + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = () => {
    const fabricNote =
      fabricSource === "envoi" && fabricUploadUrl ? `Photo du tissu envoyée : ${fabricUploadUrl}.` : "";
    const fullComment = [fabricNote, comment.trim()].filter(Boolean).join(" ");

    addToCart({
      key: `custom-${Date.now()}`,
      kind: "custom",
      productId: forModel?.id,
      name: forModel ? `Sur mesure — ${forModel.name}` : `Création sur mesure ${gender === "femme" ? "Femme" : "Homme"}`,
      detail: `${fabricSource === "maison" ? `Tissu ${fabric?.name} ${fabric?.tone}` : fabricSource === "envoi" ? `Tissu client (${fileName})` : "Tissu conseillé par l'atelier"} · ${filledMeasures.length} mesures transmises`,
      price: total,
      image: forModel?.image ?? "images/tissus.jpg",
      custom: {
        gender,
        forModel: forModel?.name,
        contact,
        measurements,
        fabricSource,
        fabricName: fabricSource === "maison" && fabric ? `${fabric.name} — ${fabric.tone}` : undefined,
        fabricFileName: fabricSource === "envoi" ? fileName ?? undefined : undefined,
        comment: fullComment || undefined,
      },
    });
    toast("Votre création sur mesure a été ajoutée au panier");
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pt-14 lg:px-8">
      {/* entête */}
      <div className="max-w-3xl">
        <p className="eyebrow">Commande personnalisée & sur mesure</p>
        <MaskLines
          className="font-display mt-3 text-5xl leading-[0.95] font-semibold text-cocoa-900 sm:text-6xl lg:text-7xl"
          lines={[
            <>Créez votre pièce,</>,
            <>
              en <em className="text-cognac-600">quatre temps</em>.
            </>,
          ]}
        />
        <Reveal delay={200}>
          <p className="mt-5 text-[15.5px] leading-relaxed text-cocoa-700">
            {forModel ? (
              <>
                Vous personnalisez le modèle{" "}
                <strong className="font-semibold text-cocoa-900">{forModel.name}</strong> —
                chaque étape reste modifiable jusqu'à la validation.
              </>
            ) : (
              <>
                Coordonnées, mesures, tissu : décrivez la tenue de vos rêves, l'atelier
                HANI&rsquo;S la coud pour vous. Comptez 72 h de confection.
              </>
            )}
          </p>
        </Reveal>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[290px_1fr] lg:gap-14">
        {/* ---- rail d'étapes ---- */}
        <aside>
          {/* progression mobile */}
          <div className="mb-8 lg:hidden">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-cocoa-500">
              <span>Étape {step} / 4</span>
              <span className="text-cocoa-800">{STEPS[step - 1].label}</span>
            </div>
            <div className="mt-2 h-1 w-full bg-sand-300/70">
              <div
                className="h-full bg-cognac-500 transition-all duration-700 ease-out"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          <div className="hidden lg:sticky lg:top-32 lg:block">
            <ol>
              {STEPS.map((s) => (
                <li key={s.n}>
                  <button
                    onClick={() => s.n < step && setStep(s.n)}
                    className={`group flex w-full cursor-pointer items-center gap-4 border-l-2 py-4 pl-6 text-left transition-all duration-400 ${
                      step === s.n
                        ? "border-cognac-500"
                        : s.n < step
                          ? "border-cocoa-800/50 hover:border-cognac-500"
                          : "border-sand-300"
                    }`}
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all duration-400 ${
                        step === s.n
                          ? "border-cocoa-800 bg-cocoa-800 text-sand-100"
                          : s.n < step
                            ? "border-cognac-500 bg-cognac-500 text-sand-50"
                            : "border-sand-300 text-cocoa-500"
                      }`}
                    >
                      {s.n < step ? <IconCheck size={16} /> : s.icon}
                    </span>
                    <span>
                      <span className="block text-[10px] tracking-[0.26em] text-cocoa-500 uppercase">
                        Étape {s.n}
                      </span>
                      <span
                        className={`font-display text-xl leading-tight font-semibold ${
                          step === s.n ? "text-cocoa-900" : "text-cocoa-500"
                        } ${s.n < step ? "group-hover:text-cocoa-800" : ""}`}
                      >
                        {s.label}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="mt-8 border border-sand-300/80 bg-sand-50/60 p-5">
              <p className="text-[11px] tracking-[0.24em] text-cocoa-500 uppercase">Besoin d'aide ?</p>
              <p className="font-display mt-2 text-xl font-semibold text-cocoa-900">
                L'atelier vous guide
              </p>
              <a
                href="https://wa.me/221778123456"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm text-cognac-600 transition-colors hover:text-cocoa-800"
              >
                <IconPhone size={15} /> +221 77 812 34 56
              </a>
            </div>
          </div>
        </aside>

        {/* ---- contenu ---- */}
        <div className="min-w-0">
          {error && (
            <p className="mb-6 border-l-2 border-cognac-600 bg-cognac-500/10 px-5 py-4 text-sm text-cognac-700">
              {error}
            </p>
          )}

          {/* ÉTAPE 1 — coordonnées */}
          {step === 1 && (
            <Reveal>
              <div className="border border-sand-300/80 bg-sand-50/70 p-7 sm:p-10">
                <h2 className="font-display text-3xl font-semibold text-cocoa-900">
                  Parlez-nous de vous
                </h2>
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="label">Nom complet *</label>
                    <input
                      className="field"
                      placeholder="ex : Awa Ndiaye"
                      value={contact.name}
                      onChange={(e) => setContact({ ...contact, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Numéro de téléphone *</label>
                    <input
                      className="field"
                      type="tel"
                      placeholder="+221 77 000 00 00"
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Adresse e-mail</label>
                    <input
                      className="field"
                      type="email"
                      placeholder="vous@exemple.sn"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    />
                    <p className="mt-1.5 text-[12px] text-cocoa-500">
                      Les confirmations de commande y sont envoyées automatiquement.
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Adresse de livraison *</label>
                    <input
                      className="field"
                      placeholder="Villa, rue, quartier…"
                      value={contact.address}
                      onChange={(e) => setContact({ ...contact, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Ville</label>
                    <input
                      className="field"
                      placeholder="Dakar, Thiès, Saint-Louis…"
                      value={contact.city}
                      onChange={(e) => setContact({ ...contact, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Modèle concerné</label>
                    <input
                      className="field"
                      value={forModel ? forModel.name : "Création libre"}
                      disabled
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Détails de votre commande</label>
                    <textarea
                      className="field min-h-28 resize-y"
                      placeholder="Décrivez la tenue souhaitée : occasion, coupe, longueur, manches…"
                      value={contact.details}
                      onChange={(e) => setContact({ ...contact, details: e.target.value })}
                    />
                    <p className="mt-2 border border-sand-300/80 bg-sand-100/80 px-4 py-3 text-[13px] text-cocoa-500 italic">
                      Exemple : « Je souhaite ce modèle avec ce tissu et des manches
                      légèrement plus larges. »
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          {/* ÉTAPE 2 — mesures */}
          {step === 2 && (
            <Reveal>
              <div className="border border-sand-300/80 bg-sand-50/70 p-7 sm:p-10">
                <h2 className="font-display text-3xl font-semibold text-cocoa-900">
                  Transmettez vos mesures
                </h2>
                <p className="mt-2 text-sm text-cocoa-500">
                  En centimètres, près du corps sans serrer. Un doute ? L'atelier vous
                  rappellera pour ajuster.
                </p>

                {/* femme / homme */}
                <div className="mt-7 grid grid-cols-2 gap-3">
                  {(
                    [
                      { g: "femme" as const, l: "Mesures Femme" },
                      { g: "homme" as const, l: "Mesures Homme" },
                    ]
                  ).map((o) => (
                    <button
                      key={o.g}
                      onClick={() => setGender(o.g)}
                      className={`cursor-pointer border px-5 py-4 text-left transition-all duration-300 ${
                        gender === o.g
                          ? "border-cocoa-800 bg-cocoa-800 text-sand-100"
                          : "border-sand-300 bg-sand-50 text-cocoa-700 hover:border-cocoa-800"
                      }`}
                    >
                      <span className="font-display text-xl font-semibold">{o.l}</span>
                      <span className="mt-0.5 block text-[11.5px] opacity-70">
                        {o.g === "femme" ? "6 mesures guidées" : "7 mesures, dont pantalon"}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-9 grid gap-10 lg:grid-cols-[280px_1fr]">
                  {/* schéma */}
                  <div>
                    <div className="bg-cocoa-800 p-6">
                      <svg viewBox="0 0 200 300" className="w-full">
                        {/* silhouette */}
                        <g stroke="#c9ae7e" strokeWidth="1.6" fill="none" strokeLinecap="round">
                          <circle cx="100" cy="26" r="14" />
                          <path d="M93 42 v10 M107 42 v10" />
                          <path d="M58 56 L142 56 L134 108 L140 168 L122 286 L78 286 L60 168 L66 108 Z" />
                          <path d="M58 56 L48 152 M142 56 L152 152" />
                        </g>
                        {/* repères */}
                        {DIAGRAM[gender].map((m) => {
                          const active = activeM !== null && fields.find((f) => f.n === m.n)?.key === activeM;
                          return (
                            <g key={m.n}>
                              <path
                                d={m.d}
                                stroke={active ? "#d3a465" : "#f3ebdc"}
                                strokeWidth={active ? 2.4 : 1.3}
                                strokeDasharray="5 4"
                                fill="none"
                                className="transition-all duration-300"
                              />
                            </g>
                          );
                        })}
                        {/* pastilles numérotées */}
                        {DIAGRAM[gender].map((m) => {
                          const coords = m.d.match(/M([\d.]+) ([\d.]+)/);
                          const x = coords ? parseFloat(coords[1]) : 0;
                          const y = coords ? parseFloat(coords[2]) : 0;
                          return (
                            <g key={`b${m.n}`}>
                              <circle cx={x} cy={y} r="9" fill="#a87437" />
                              <text
                                x={x}
                                y={y + 3.5}
                                textAnchor="middle"
                                fontSize="10.5"
                                fontWeight="600"
                                fill="#221710"
                                style={{ fontFamily: "Jost, sans-serif" }}
                              >
                                {m.n}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                    <ul className="mt-4 space-y-1">
                      {fields.map((f) => (
                        <li
                          key={f.key}
                          onMouseEnter={() => setActiveM(f.key)}
                          onMouseLeave={() => setActiveM(null)}
                          className={`flex cursor-default items-center gap-3 px-2 py-1.5 text-sm transition-all duration-300 ${
                            activeM === f.key ? "bg-cognac-500/15 text-cocoa-900" : "text-cocoa-700"
                          }`}
                        >
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cognac-500 text-[11px] font-semibold text-sand-50">
                            {f.n}
                          </span>
                          {f.label}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* champs */}
                  <div className="grid content-start gap-5 sm:grid-cols-2">
                    {fields.map((f) => (
                      <div
                        key={f.key}
                        className={`transition-all duration-300 ${activeM === f.key ? "-translate-y-0.5" : ""}`}
                      >
                        <label className="label">
                          {f.n}. {f.label}
                        </label>
                        <div className={`relative rounded-[3px] transition-shadow duration-300 ${activeM === f.key ? "shadow-[0_0_0_3px_rgba(168,116,55,0.25)]" : ""}`}>
                          <input
                            type="number"
                            inputMode="decimal"
                            min="0"
                            className="field pr-12"
                            placeholder="ex : 92"
                            value={measurements[f.key] ?? ""}
                            onChange={(e) =>
                              setMeasurements({ ...measurements, [f.key]: e.target.value })
                            }
                            onFocus={() => setActiveM(f.key)}
                            onBlur={() => setActiveM(null)}
                          />
                          <span className="absolute top-1/2 right-4 -translate-y-1/2 text-[12px] text-cocoa-500">
                            cm
                          </span>
                        </div>
                      </div>
                    ))}
                    <p className="text-[12.5px] leading-relaxed text-cocoa-500 sm:col-span-2">
                      {filledMeasures.length === 0
                        ? "Aucune mesure n'est obligatoire en ligne : un couturier vous appelle pour les prendre ensemble si besoin."
                        : `${filledMeasures.length} mesure${filledMeasures.length > 1 ? "s" : ""} renseignée${filledMeasures.length > 1 ? "s" : ""} — l'atelier les vérifiera avec vous par téléphone.`}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          {/* ÉTAPE 3 — tissu */}
          {step === 3 && (
            <Reveal>
              <div className="border border-sand-300/80 bg-sand-50/70 p-7 sm:p-10">
                <h2 className="font-display text-3xl font-semibold text-cocoa-900">
                  Choisissez votre tissu
                </h2>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {(
                    [
                      { id: "maison" as const, t: "Tissu de la maison", d: "Notre galerie de 8 étoffes", icon: <IconSwatch size={20} /> },
                      { id: "envoi" as const, t: "J'envoie mon tissu", d: "Photo de votre propre étoffe", icon: <IconUpload size={20} /> },
                      { id: "conseil" as const, t: "Conseillez-moi", d: "L'atelier choisit pour vous", icon: <IconNeedle size={20} /> },
                    ]
                  ).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setFabricSource(s.id)}
                      className={`cursor-pointer border p-5 text-left transition-all duration-300 ${
                        fabricSource === s.id
                          ? "border-cocoa-800 bg-cocoa-800 text-sand-100 shadow-[0_18px_40px_-18px_rgba(46,31,19,0.55)]"
                          : "border-sand-300 bg-sand-50 text-cocoa-800 hover:border-cocoa-800"
                      }`}
                    >
                      <span className={fabricSource === s.id ? "text-cognac-300" : "text-cognac-600"}>
                        {s.icon}
                      </span>
                      <span className="font-display mt-3 block text-xl leading-tight font-semibold">{s.t}</span>
                      <span className="mt-1 block text-[12px] opacity-70">{s.d}</span>
                    </button>
                  ))}
                </div>

                {fabricSource === "maison" && (
                  <div className="mt-9">
                    <p className="label">Galerie de tissus HANI&rsquo;S</p>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {FABRICS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setFabricId(f.id)}
                          className={`group cursor-pointer border p-3 text-left transition-all duration-300 ${
                            fabricId === f.id
                              ? "border-cognac-500 bg-sand-50 shadow-[0_0_0_3px_rgba(168,116,55,0.2)]"
                              : "border-sand-300 bg-sand-50/60 hover:border-cocoa-800"
                          }`}
                        >
                          <span
                            className="block h-16 w-full border border-cocoa-900/10 transition-transform duration-300 group-hover:scale-[1.02]"
                            style={{ background: f.swatch }}
                          />
                          <span className="mt-2.5 block text-[13px] leading-tight font-semibold text-cocoa-900">
                            {f.name}
                          </span>
                          <span className="block text-[11px] text-cocoa-500">
                            {f.tone} · {f.extra === 0 ? "inclus" : `+ ${fmtPrice(f.extra)}`}
                          </span>
                        </button>
                      ))}
                    </div>
                    {fabric && (
                      <p className="mt-4 border-l-2 border-cognac-500 pl-4 text-sm text-cocoa-700 italic">
                        {fabric.desc}
                      </p>
                    )}
                  </div>
                )}

                {fabricSource === "envoi" && (
                  <div className="mt-9">
                    <p className="label">Photo de votre tissu</p>
                    {filePreview ? (
                      <div className="flex flex-wrap items-center gap-5 border border-sand-300 bg-sand-50 p-4">
                        <img
                          src={filePreview}
                          alt="Aperçu du tissu envoyé"
                          className="h-24 w-24 rounded-[6px] border border-sand-300 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-cocoa-900">{fileName}</p>
                          <p className="text-[12px] text-cocoa-500">
                            L'atelier vérifiera la qualité et la quantité de tissu, puis confirmera le devis.
                          </p>
                        </div>
                        <label
                          htmlFor="fabric-file"
                          className="cursor-pointer border border-sand-300 px-4 py-2 text-[11px] tracking-[0.18em] text-cocoa-700 uppercase transition-colors hover:border-cocoa-800"
                        >
                          Changer
                        </label>
                      </div>
                    ) : (
                      <label
                        htmlFor="fabric-file"
                        className="flex cursor-pointer flex-col items-center gap-3 border-2 border-dashed border-sand-400 bg-sand-50/60 px-6 py-12 text-center transition-colors hover:border-cognac-500 hover:bg-sand-50"
                      >
                        <IconUpload size={28} className="text-cognac-600" />
                        <span className="text-sm font-medium text-cocoa-800">
                          Cliquez pour télécharger une photo du tissu
                        </span>
                        <span className="text-[12px] text-cocoa-500">
                          JPG ou PNG — lumière naturelle de préférence
                        </span>
                      </label>
                    )}
                    <input id="fabric-file" type="file" accept="image/*" className="hidden" onChange={onFile} />
                    {fabricUploading && (
                      <p className="mt-3 flex items-center gap-2 text-[12.5px] text-cocoa-600">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-sand-300 border-t-cognac-600" />
                        Envoi de la photo en cours…
                      </p>
                    )}
                    {fabricUploadUrl && !fabricUploading && (
                      <p className="mt-3 flex items-center gap-2 text-[12.5px] text-cognac-700">
                        <IconCheck size={14} /> Photo envoyée avec succès.
                      </p>
                    )}
                    {fabricUploadError && (
                      <p className="mt-3 text-[12.5px] text-cognac-700">{fabricUploadError}</p>
                    )}
                  </div>
                )}

                {fabricSource === "conseil" && (
                  <p className="mt-9 border border-sand-300 bg-sand-50 px-5 py-4 text-sm leading-relaxed text-cocoa-700">
                    Décrivez l'occasion et vos envies dans le commentaire ci-dessous : un
                    couturier vous proposera 2 à 3 étoffes adaptées, photos à l'appui, avant de
                    couper.
                  </p>
                )}

                <div className="mt-9">
                  <label className="label">Commentaires & demandes particulières</label>
                  <textarea
                    className="field min-h-28 resize-y"
                    placeholder="Manches plus larges, broderie au col, deadline pour une cérémonie…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
              </div>
            </Reveal>
          )}

          {/* ÉTAPE 4 — récap */}
          {step === 4 && (
            <Reveal>
              <div className="border border-sand-300/80 bg-sand-50/70 p-7 sm:p-10">
                <h2 className="font-display text-3xl font-semibold text-cocoa-900">
                  Tout est parfait ?
                </h2>
                <div className="mt-7 divide-y divide-sand-300/70 border-y border-sand-300/70">
                  {[
                    {
                      t: "Contact & livraison",
                      s: 1,
                      v: `${contact.name} · ${contact.phone}${contact.city ? ` · ${contact.city}` : ""}`,
                    },
                    {
                      t: `Mesures ${gender === "femme" ? "Femme" : "Homme"}`,
                      s: 2,
                      v:
                        filledMeasures.length > 0
                          ? filledMeasures.map((f) => `${f.label} : ${measurements[f.key]} cm`).join(" · ")
                          : "Aucune mesure transmise — l'atelier vous appellera",
                    },
                    {
                      t: "Tissu",
                      s: 3,
                      v:
                        fabricSource === "maison" && fabric
                          ? `${fabric.name} — ${fabric.tone} (${fabric.extra === 0 ? "inclus" : `+ ${fmtPrice(fabric.extra)}`})`
                          : fabricSource === "envoi"
                            ? `Votre tissu (${fileName})`
                            : "Conseillé par l'atelier",
                    },
                  ].map((r) => (
                    <div key={r.t} className="flex items-start justify-between gap-4 py-4">
                      <div className="min-w-0">
                        <p className="text-[11px] tracking-[0.24em] text-cocoa-500 uppercase">{r.t}</p>
                        <p className="mt-1 text-[14.5px] leading-relaxed break-words text-cocoa-800">{r.v}</p>
                      </div>
                      <button
                        onClick={() => setStep(r.s)}
                        className="shrink-0 cursor-pointer text-[11px] font-medium tracking-[0.18em] text-cognac-600 uppercase transition-colors hover:text-cocoa-800"
                      >
                        Modifier
                      </button>
                    </div>
                  ))}
                  {comment.trim() && (
                    <div className="py-4">
                      <p className="text-[11px] tracking-[0.24em] text-cocoa-500 uppercase">Commentaire</p>
                      <p className="mt-1 text-[14.5px] text-cocoa-800 italic">« {comment.trim()} »</p>
                    </div>
                  )}
                </div>

                <div className="mt-7 flex flex-wrap items-end justify-between gap-6">
                  <div>
                    <p className="text-[11px] tracking-[0.24em] text-cocoa-500 uppercase">Prix estimé</p>
                    <p className="font-display mt-1 text-5xl font-semibold text-cocoa-900">{fmtPrice(total)}</p>
                    {fabricSource === "envoi" && (
                      <p className="mt-1 text-[12px] text-cocoa-500">
                        Confirmé sous 24 h après vérification de votre tissu
                      </p>
                    )}
                  </div>
                  <button onClick={submit} className="btn-primary">
                    <IconBag size={16} /> Ajouter au panier
                  </button>
                </div>
              </div>
            </Reveal>
          )}

          {/* navigation */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              className={`btn-ghost ${step === 1 ? "invisible" : ""}`}
            >
              Retour
            </button>
            {step < 4 && (
              <button onClick={next} disabled={fabricUploading} className="btn-primary disabled:cursor-wait disabled:opacity-80">
                {fabricUploading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-sand-100/40 border-t-sand-100" />
                    Envoi en cours…
                  </>
                ) : (
                  <>
                    Continuer <IconArrow size={15} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

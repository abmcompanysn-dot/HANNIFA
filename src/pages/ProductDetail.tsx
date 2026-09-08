import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fmtPrice } from "../data/catalog";
import type { Product as UiProduct } from "../data/catalog";
import { listProducts, ABMCYApiError } from "../services/abmcy";
import { mapProducts } from "../lib/mapProduct";
import { useStore } from "../context/StoreContext";
import ProductCard from "../components/ProductCard";
import { Reveal } from "../components/Reveal";
import {
  IconArrow,
  IconBag,
  IconCheck,
  IconChevron,
  IconMinus,
  IconNeedle,
  IconPhone,
  IconPlus,
  IconTruck,
} from "../components/Icons";

const CROPS = [
  { label: "Vue silhouette", pos: "center top" },
  { label: "Vue taille", pos: "center 45%" },
  { label: "Vue détail", pos: "center 82%" },
];

const ACCORDIONS = [
  {
    title: "Détails & composition",
    body: (p: string) => p,
  },
  {
    title: "Livraison & retouches",
    body: () =>
      "Confection et expédition sous 72 h depuis notre atelier de Sacré-Cœur, Dakar. Livraison offerte dans Dakar, 48 h pour les régions. Retouches incluses sous 15 jours.",
  },
  {
    title: "Entretien",
    body: () =>
      "Lavage délicat à 30° ou nettoyage à sec pour les pièces brodées. Repassage doux sur l'envers. Conservez votre tenue sur cintre, à l'abri du soleil direct.",
  },
];

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useStore();

  const [products, setProducts] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listProducts()
      .then((list) => {
        if (cancelled) return;
        setProducts(mapProducts(list));
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof ABMCYApiError ? e.message : "Impossible de charger ce modèle pour le moment.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const product = useMemo(() => products.find((p) => p.id === id), [products, id]);

  const [ci, setCi] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [crop, setCrop] = useState(0);
  const [open, setOpen] = useState(0);
  const [sizeHint, setSizeHint] = useState(false);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-32 text-center">
        <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-sand-300 border-t-cognac-600" />
        <p className="mt-4 text-sm text-cocoa-500">Chargement du modèle…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-32 text-center">
        <p className="eyebrow">Erreur</p>
        <p className="font-display mt-4 text-3xl text-cocoa-900 italic">Impossible de charger ce modèle</p>
        <p className="mt-3 text-sm text-cognac-700">{error}</p>
        <Link to="/boutique" className="btn-primary mt-8">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-32 text-center">
        <p className="eyebrow">Modèle introuvable</p>
        <p className="font-display mt-4 text-4xl text-cocoa-900 italic">Cette pièce n'existe plus</p>
        <Link to="/boutique" className="btn-primary mt-8">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const color = product.colors[ci];

  const order = () => {
    if (!size) {
      setSizeHint(true);
      setTimeout(() => setSizeHint(false), 2200);
      return;
    }
    addToCart(
      {
        key: `${product.id}-${color.name}-${size}`,
        kind: "product",
        productId: product.id,
        name: product.name,
        detail: `${color.name} · Taille ${size}`,
        price: product.price,
        image: product.image,
        colorName: color.name,
        size,
      },
      qty
    );
  };

  const similar = products.filter((p) => p.gender === product.gender && p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-5 pt-10 lg:px-8">
      {/* fil d'Ariane */}
      <nav className="flex flex-wrap items-center gap-2 text-[11.5px] uppercase tracking-[0.16em] text-cocoa-500">
        <Link to="/" className="transition-colors hover:text-cognac-600">Accueil</Link>
        <span className="text-sand-400">/</span>
        <Link to="/boutique" className="transition-colors hover:text-cognac-600">Boutique</Link>
        <span className="text-sand-400">/</span>
        <Link
          to={`/boutique/${product.gender}`}
          className="transition-colors hover:text-cognac-600"
        >
          {product.gender === "femme" ? "Femme" : "Homme"}
        </Link>
        <span className="text-sand-400">/</span>
        <span className="text-cocoa-800">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* ------- visuels ------- */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <div className="relative overflow-hidden arch border border-sand-300/80 bg-sand-200">
              <img
                src={product.image}
                alt={`${product.name} — coloris ${color.name}`}
                className="aspect-[3/4.1] w-full object-cover transition-[filter] duration-700"
                style={{
                  filter: color.filter || undefined,
                  objectPosition: CROPS[crop].pos,
                }}
              />
              <div className="absolute top-5 left-1/2 -translate-x-1/2">
                {product.isNew && (
                  <span className="bg-cognac-500 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-sand-50">
                    Nouveauté
                  </span>
                )}
              </div>
            </div>
          </Reveal>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {CROPS.map((c, i) => (
              <button
                key={c.label}
                onClick={() => setCrop(i)}
                title={c.label}
                className={`cursor-pointer overflow-hidden rounded-[6px] border transition-all duration-300 ${
                  crop === i
                    ? "border-cognac-500 ring-2 ring-cognac-500/25"
                    : "border-sand-300/70 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={product.image}
                  alt={c.label}
                  className="aspect-[3/3.4] w-full object-cover"
                  style={{ filter: color.filter || undefined, objectPosition: c.pos }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* ------- infos ------- */}
        <div>
          <p className="eyebrow">
            {product.gender === "femme" ? "Femme" : "Homme"} · {product.sub}
          </p>
          <h1 className="font-display mt-3 text-5xl leading-none font-semibold text-cocoa-900 sm:text-6xl">
            {product.name}
          </h1>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <p className="font-display text-4xl font-semibold text-cognac-600">{fmtPrice(product.price)}</p>
            <p className="text-[12px] uppercase tracking-[0.18em] text-cocoa-500">
              Retouches incluses · Livraison 72 h
            </p>
          </div>

          <p className="mt-6 max-w-lg text-[15.5px] leading-relaxed text-cocoa-700">{product.description}</p>

          {/* couleur */}
          <div className="mt-9">
            <div className="flex items-center justify-between">
              <p className="label !mb-0">
                Couleur — <span className="normal-case tracking-normal text-cocoa-800">{color.name}</span>
              </p>
              <p className="text-[11px] text-cocoa-500 italic">Aperçu appliqué à la photo</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {product.colors.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setCi(i)}
                  title={c.name}
                  aria-label={`Choisir la couleur ${c.name}`}
                  className={`group/c relative h-11 w-11 cursor-pointer rounded-full border-2 transition-all duration-300 hover:scale-105 ${
                    i === ci ? "border-cocoa-800 scale-105" : "border-sand-300"
                  }`}
                  style={{ background: c.hex }}
                >
                  {i === ci && (
                    <span className="absolute inset-0 grid place-items-center text-sand-50 drop-shadow">
                      <IconCheck size={16} />
                    </span>
                  )}
                  <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 rounded-sm bg-cocoa-900 px-2 py-0.5 text-[10px] whitespace-nowrap text-sand-100 opacity-0 transition-opacity duration-300 group-hover/c:opacity-100">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* taille */}
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <p className="label !mb-0">Taille</p>
              {sizeHint && (
                <p className="text-[12px] font-medium text-cognac-600">Choisissez une taille pour commander ↓</p>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`min-w-14 cursor-pointer border px-4 py-3 text-sm font-medium transition-all duration-300 ${
                    size === s
                      ? "border-cocoa-800 bg-cocoa-800 text-sand-100"
                      : "border-sand-300 bg-sand-50/60 text-cocoa-700 hover:border-cocoa-800"
                  } ${sizeHint && !size ? "border-cognac-500" : ""}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-[12px] text-cocoa-500">
              Entre deux tailles ? Commandez sur mesure, l'atelier ajuste au centimètre.
            </p>
          </div>

          {/* quantité + commander */}
          <div className="mt-10 flex flex-wrap items-stretch gap-3">
            <div className="flex items-center border border-sand-300 bg-sand-50/60">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                aria-label="Diminuer la quantité"
                className="grid h-full w-12 cursor-pointer place-items-center transition-colors hover:bg-sand-200"
              >
                <IconMinus size={15} />
              </button>
              <span className="w-10 text-center font-display text-xl font-semibold">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                aria-label="Augmenter la quantité"
                className="grid h-full w-12 cursor-pointer place-items-center transition-colors hover:bg-sand-200"
              >
                <IconPlus size={15} />
              </button>
            </div>
            <button onClick={order} className="btn-primary flex-1 basis-52">
              <IconBag size={16} /> Commander — {fmtPrice(product.price * qty)}
            </button>
          </div>

          <Link to={`/sur-mesure?modele=${product.id}`} className="btn-ghost mt-3 w-full">
            <IconNeedle size={16} /> Personnaliser ce modèle sur mesure
          </Link>

          {/* accordéons */}
          <div className="mt-12 divide-y divide-sand-300/70 border-y border-sand-300/70">
            {ACCORDIONS.map((a, i) => (
              <div key={a.title}>
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="flex w-full cursor-pointer items-center justify-between py-5 text-left"
                >
                  <span className="text-[13px] font-medium uppercase tracking-[0.2em] text-cocoa-800">
                    {a.title}
                  </span>
                  <IconChevron
                    size={17}
                    className={`text-cocoa-500 transition-transform duration-400 ${open === i ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-500 ease-out"
                  style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 text-sm leading-relaxed text-cocoa-500">
                      {a.body(product.composition)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* garanties */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: <IconTruck size={20} />, t: "Livraison 72 h", s: "Dakar & régions" },
              { icon: <IconNeedle size={20} />, t: "Cousu main", s: "Atelier Sacré-Cœur" },
              { icon: <IconPhone size={20} />, t: "Conseil WhatsApp", s: "7 j / 7" },
            ].map((g) => (
              <div key={g.t} className="border border-sand-300/70 bg-sand-50/50 px-3 py-4">
                <span className="mx-auto grid place-items-center text-cognac-600">{g.icon}</span>
                <p className="mt-2 text-[12px] font-semibold text-cocoa-800">{g.t}</p>
                <p className="text-[11px] text-cocoa-500">{g.s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* similaires */}
      {similar.length > 0 && (
        <section className="mt-24">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Dans le même esprit</p>
              <h2 className="font-display mt-2 text-4xl font-semibold text-cocoa-900">
                Vous aimerez aussi
              </h2>
            </div>
            <Link
              to={`/boutique/${product.gender}`}
              className="group hidden items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-cocoa-700 transition-colors hover:text-cognac-600 sm:inline-flex"
            >
              Tout voir
              <IconArrow size={15} className="transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((p, i) => (
              <ProductCard key={p.id} product={p} delay={i * 90} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MEASURES_FEMME,
  MEASURES_HOMME,
  ORDER_STAGES,
  fmtPrice,
  stageOf,
} from "../data/catalog";
import { useStore, type Order } from "../context/StoreContext";
import { MaskLines, Reveal } from "../components/Reveal";
import {
  IconArrow,
  IconBag,
  IconCheck,
  IconChevron,
  IconClock,
  IconEdit,
  IconMail,
  IconPhone,
  IconPin,
  IconWhatsApp,
} from "../components/Icons";

const BADGE = [
  "border-cognac-500/50 bg-cognac-500/12 text-cognac-700",
  "border-cognac-500/50 bg-cognac-500/12 text-cognac-700",
  "border-cocoa-800/30 bg-cocoa-800/8 text-cocoa-800",
  "border-[#31405c]/35 bg-[#31405c]/10 text-[#31405c]",
  "border-[#5f7a52]/40 bg-[#5f7a52]/12 text-[#4a6340]",
];

function Timeline({ stage }: { stage: number }) {
  return (
    <ol className="grid grid-cols-5 gap-1">
      {ORDER_STAGES.map((s, i) => {
        const done = i < stage;
        const current = i === stage;
        return (
          <li key={s.key} className="relative flex flex-col items-center text-center">
            {i > 0 && (
              <span
                aria-hidden
                className={`absolute top-[17px] right-1/2 h-[2px] w-full ${
                  i <= stage ? "bg-cognac-500" : "bg-sand-300"
                }`}
              />
            )}
            <span
              className={`relative z-[1] grid h-9 w-9 place-items-center rounded-full border-2 transition-colors duration-500 ${
                done
                  ? "border-cocoa-800 bg-cocoa-800 text-sand-100"
                  : current
                    ? "pulse-dot border-cognac-500 bg-cognac-500 text-sand-50"
                    : "border-sand-300 bg-sand-50 text-cocoa-500"
              }`}
            >
              {done ? <IconCheck size={14} /> : <span className="text-[11px] font-semibold">{i + 1}</span>}
            </span>
            <span
              className={`mt-2.5 px-0.5 text-[9.5px] leading-tight font-medium sm:text-[11px] ${
                i <= stage ? "text-cocoa-900" : "text-cocoa-500"
              }`}
            >
              {s.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default function EspaceClient() {
  const { orders, customer, updateOrder, toast } = useStore();
  const [openId, setOpenId] = useState<string | null>(orders[0]?.id ?? null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    address: "",
    city: "",
    note: "",
    measurements: {} as Record<string, string>,
    comment: "",
  });
  const [, setTick] = useState(0);

  /* rafraîchit l'avancement des commandes (statuts dérivés du temps écoulé) */
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 20000);
    return () => clearInterval(t);
  }, []);

  const startEdit = (o: Order) => {
    const custom = o.items.find((i) => i.custom)?.custom;
    setEditForm({
      address: o.customer.address,
      city: o.customer.city,
      note: o.customer.note ?? "",
      measurements: { ...(custom?.measurements ?? {}) },
      comment: custom?.comment ?? "",
    });
    setEditingId(o.id);
  };

  const saveEdit = (o: Order) => {
    const items = o.items.map((i) =>
      i.custom
        ? {
            ...i,
            custom: {
              ...i.custom,
              measurements: editForm.measurements,
              comment: editForm.comment.trim() || undefined,
            },
          }
        : i
    );
    updateOrder(o.id, {
      customer: { ...o.customer, address: editForm.address, city: editForm.city, note: editForm.note },
      items,
    });
    setEditingId(null);
    toast("Modifications enregistrées — l'atelier en est informé");
  };

  return (
    <div className="mx-auto max-w-5xl px-5 pt-14 lg:px-8">
      <p className="eyebrow">Espace client</p>
      <MaskLines
        className="font-display mt-3 text-5xl leading-[0.95] font-semibold text-cocoa-900 sm:text-6xl lg:text-7xl"
        lines={[
          <>Vos commandes,</>,
          <>
            suivies de <em className="text-cognac-600">près</em>.
          </>,
        ]}
      />
      <Reveal delay={180}>
        <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-cocoa-700">
          Historique complet, avancement en temps réel et modifications possibles tant que
          l'atelier n'a pas lancé la confection. Chaque confirmation est envoyée
          automatiquement par e-mail et WhatsApp.
        </p>
      </Reveal>

      {/* profil */}
      {customer && (
        <Reveal className="mt-10">
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4 border border-sand-300/80 bg-sand-50/70 px-7 py-6">
            <div className="flex items-center gap-4">
              <span className="font-display grid h-14 w-14 place-items-center rounded-full bg-cocoa-800 text-2xl font-semibold text-sand-100">
                {customer.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="font-display text-2xl leading-tight font-semibold text-cocoa-900">
                  {customer.name}
                </p>
                <p className="text-[11px] tracking-[0.22em] text-cocoa-500 uppercase">
                  Cliente HANI&rsquo;S · {orders.length} commande{orders.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-cocoa-700">
              {customer.phone && (
                <span className="flex items-center gap-2"><IconPhone size={15} className="text-cognac-600" />{customer.phone}</span>
              )}
              {customer.email && (
                <span className="flex items-center gap-2"><IconMail size={15} className="text-cognac-600" />{customer.email}</span>
              )}
              {customer.city && (
                <span className="flex items-center gap-2"><IconPin size={15} className="text-cognac-600" />{customer.city}</span>
              )}
            </div>
          </div>
        </Reveal>
      )}

      {/* commandes */}
      {orders.length === 0 ? (
        <div className="mt-16 border border-dashed border-sand-400 px-8 py-20 text-center">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-sand-300 text-cocoa-500">
            <IconBag size={30} />
          </span>
          <p className="font-display mt-6 text-3xl text-cocoa-900 italic">Aucune commande pour le moment</p>
          <p className="mx-auto mt-3 max-w-sm text-sm text-cocoa-500">
            Vos commandes, leur historique et leur suivi apparaîtront ici dès votre premier
            achat.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/boutique" className="btn-primary">Découvrir la boutique</Link>
            <Link to="/sur-mesure" className="btn-ghost">Créer sur mesure</Link>
          </div>
        </div>
      ) : (
        <div className="mt-12 space-y-6">
          {orders.map((o) => {
            const stage = stageOf(o.placedAt);
            const open = openId === o.id;
            const editing = editingId === o.id;
            const customItem = o.items.find((i) => i.custom);
            const editable = stage <= 1;
            const date = new Date(o.placedAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <Reveal key={o.id}>
                <div className="border border-sand-300/80 bg-sand-50/70 transition-shadow duration-400 hover:shadow-[0_20px_50px_-24px_rgba(60,42,27,0.4)]">
                  <button
                    onClick={() => setOpenId(open ? null : o.id)}
                    className="flex w-full cursor-pointer flex-wrap items-center gap-x-6 gap-y-3 px-7 py-6 text-left"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-2xl leading-tight font-semibold text-cocoa-900">{o.id}</p>
                      <p className="mt-0.5 flex items-center gap-2 text-[12px] text-cocoa-500">
                        <IconClock size={13} /> Passée le {date}
                      </p>
                    </div>
                    <span className={`border px-3 py-1.5 text-[10.5px] font-semibold tracking-[0.14em] uppercase ${BADGE[stage]}`}>
                      {ORDER_STAGES[stage].label}
                    </span>
                    <span className="ml-auto flex items-center gap-5">
                      <span className="font-display text-2xl font-semibold text-cocoa-900">{fmtPrice(o.total)}</span>
                      <IconChevron size={18} className={`text-cocoa-500 transition-transform duration-400 ${open ? "rotate-180" : ""}`} />
                    </span>
                  </button>

                  {open && (
                    <div className="border-t border-sand-300/70 px-7 py-7">
                      {/* avancement */}
                      <p className="label">Avancement de la confection</p>
                      <Timeline stage={stage} />
                      <p className="mt-4 flex items-center gap-2 text-[12px] text-cocoa-500">
                        <IconCheck size={14} className="text-cognac-600" />
                        Confirmation automatique envoyée par e-mail et WhatsApp à chaque étape.
                      </p>

                      {/* articles */}
                      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
                        <div>
                          <p className="label">Articles ({o.items.length})</p>
                          <ul className="divide-y divide-sand-300/60 border-y border-sand-300/60">
                            {o.items.map((i) => (
                              <li key={i.key} className="flex items-center gap-4 py-4">
                                <div className="h-16 w-13 shrink-0 overflow-hidden rounded-[5px] border border-sand-300/70 bg-sand-200">
                                  {i.image && <img src={i.image} alt="" className="h-full w-full object-cover object-top" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-display text-[16px] font-semibold text-cocoa-900">{i.name}</p>
                                  {i.detail && <p className="text-[12px] text-cocoa-500">{i.detail}</p>}
                                  {i.custom?.comment && (
                                    <p className="mt-1 text-[12px] text-cocoa-700 italic">« {i.custom.comment} »</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-cocoa-900">{fmtPrice(i.price * i.qty)}</p>
                                  <p className="text-[11px] text-cocoa-500">Qté {i.qty}</p>
                                </div>
                              </li>
                            ))}
                          </ul>

                          {/* mesures transmises */}
                          {customItem?.custom &&
                            Object.entries(customItem.custom.measurements).filter(([, v]) => v).length > 0 && (
                              <div className="mt-6">
                                <p className="label">Mesures transmises</p>
                                <div className="flex flex-wrap gap-2">
                                  {(customItem.custom.gender === "femme" ? MEASURES_FEMME : MEASURES_HOMME)
                                    .filter((f) => customItem.custom?.measurements[f.key])
                                    .map((f) => (
                                      <span key={f.key} className="border border-sand-300 bg-sand-100/80 px-3 py-1.5 text-[12px] text-cocoa-700">
                                        {f.label} : <strong className="font-semibold">{customItem.custom?.measurements[f.key]} cm</strong>
                                      </span>
                                    ))}
                                </div>
                              </div>
                            )}
                        </div>

                        <div className="space-y-5">
                          <div>
                            <p className="label">Livraison</p>
                            <p className="text-sm leading-relaxed text-cocoa-700">
                              {o.customer.name}
                              <br />
                              {o.customer.address}
                              {o.customer.city && <>, ${o.customer.city}</>}
                              <br />
                              {o.customer.phone}
                            </p>
                          </div>
                          <div>
                            <p className="label">Paiement</p>
                            <p className="inline-flex items-center gap-2 border border-sand-300 bg-sand-100/80 px-3 py-2 text-sm font-medium text-cocoa-800">
                              <IconCheck size={15} className="text-cognac-600" /> {o.paymentLabel} — validé
                            </p>
                          </div>
                          <a
                            href="https://wa.me/221778123456"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 border border-sand-300 px-4 py-3 text-sm text-cocoa-700 transition-colors hover:border-cognac-500 hover:text-cognac-600"
                          >
                            <IconWhatsApp size={18} /> Une question sur cette commande ?
                          </a>
                        </div>
                      </div>

                      {/* modification avant validation */}
                      <div className="mt-8 border-t border-sand-300/70 pt-6">
                        {editable && !editing && (
                          <button onClick={() => startEdit(o)} className="btn-ghost !py-3">
                            <IconEdit size={15} /> Modifier avant validation
                          </button>
                        )}
                        {!editable && !editing && (
                          <p className="text-[12.5px] text-cocoa-500">
                            La confection est lancée — pour tout ajustement, contactez
                            l'atelier via WhatsApp.
                          </p>
                        )}

                        {editing && (
                          <div className="border border-sand-300 bg-sand-50 p-6">
                            <p className="font-display text-xl font-semibold text-cocoa-900">
                              Modifier les informations
                            </p>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                              <div>
                                <label className="label">Adresse de livraison</label>
                                <input
                                  className="field"
                                  value={editForm.address}
                                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="label">Ville</label>
                                <input
                                  className="field"
                                  value={editForm.city}
                                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                />
                              </div>
                              {customItem?.custom && (
                                <>
                                  {(customItem.custom.gender === "femme" ? MEASURES_FEMME : MEASURES_HOMME).map((f) => (
                                    <div key={f.key}>
                                      <label className="label">{f.label}</label>
                                      <div className="relative">
                                        <input
                                          type="number"
                                          className="field pr-12"
                                          value={editForm.measurements[f.key] ?? ""}
                                          onChange={(e) =>
                                            setEditForm({
                                              ...editForm,
                                              measurements: { ...editForm.measurements, [f.key]: e.target.value },
                                            })
                                          }
                                          placeholder="cm"
                                        />
                                        <span className="absolute top-1/2 right-4 -translate-y-1/2 text-[12px] text-cocoa-500">cm</span>
                                      </div>
                                    </div>
                                  ))}
                                  <div className="sm:col-span-2">
                                    <label className="label">Commentaire pour l'atelier</label>
                                    <textarea
                                      className="field min-h-20 resize-y"
                                      value={editForm.comment}
                                      onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="mt-6 flex gap-3">
                              <button onClick={() => saveEdit(o)} className="btn-primary !py-3">
                                <IconCheck size={15} /> Enregistrer les modifications
                              </button>
                              <button onClick={() => setEditingId(null)} className="btn-ghost !py-3">
                                Annuler
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* aide */}
      <Reveal className="mt-16">
        <div className="flex flex-col items-start justify-between gap-6 bg-cocoa-800 px-8 py-9 text-sand-100 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow !text-cognac-300">L'atelier reste à vos côtés</p>
            <p className="font-display mt-2 text-2xl font-medium sm:text-3xl">
              Retouches incluses sous 15 jours après livraison.
            </p>
          </div>
          <a href="https://wa.me/221778123456" target="_blank" rel="noreferrer" className="btn-light shrink-0">
            <IconWhatsApp size={16} /> Écrire à l'atelier
          </a>
        </div>
      </Reveal>
    </div>
  );
}

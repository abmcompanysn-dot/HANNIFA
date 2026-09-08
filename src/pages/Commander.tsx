import { useState } from "react";
import { Link } from "react-router-dom";
import { PAYMENTS, fmtPrice } from "../data/catalog";
import { useStore, type Customer } from "../context/StoreContext";
import {
  createOrder,
  createCustomOrder,
  ABMCYApiError,
  type Order as ApiOrder,
} from "../services/abmcy";
import { Reveal } from "../components/Reveal";
import { IconArrow, IconBag, IconCheck } from "../components/Icons";

export default function Commander() {
  const { cart, cartTotal, customer, clearCart, toast } = useStore();

  const [form, setForm] = useState<Customer>(
    customer ?? { name: "", phone: "", email: "", address: "", city: "", note: "" }
  );
  const [payment, setPayment] = useState("wave");
  const [processing, setProcessing] = useState(false);
  const [placed, setPlaced] = useState<ApiOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ------- écran de confirmation ------- */
  if (placed) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <Reveal>
          <span className="mx-auto grid h-24 w-24 place-items-center rounded-full border-2 border-cognac-500 text-cognac-600">
            <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path className="check-path" d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
          </span>
          <p className="eyebrow mt-8">Confirmation automatique envoyée</p>
          <h1 className="font-display mt-3 text-5xl font-semibold text-cocoa-900 sm:text-6xl">
            Merci, {placed.customer_name.split(" ")[0]} !
          </h1>
          <p className="mt-5 text-[15.5px] leading-relaxed text-cocoa-700">
            Votre commande <strong className="font-semibold text-cocoa-900">{placed.order_number}</strong> d'un
            montant de <strong className="font-semibold text-cocoa-900">{fmtPrice(placed.total_amount)}</strong>{" "}
            est enregistrée. Une confirmation vient d'être envoyée par e-mail —
            l'atelier vous contacte sous 2 h pour valider les détails. Vous réglerez à la
            livraison.
          </p>
          <div className="mx-auto mt-9 max-w-sm border border-sand-300/80 bg-sand-50/70 p-6 text-left">
            <p className="text-[11px] tracking-[0.24em] text-cocoa-500 uppercase">Prochaines étapes</p>
            <ul className="mt-3 space-y-2.5 text-sm text-cocoa-700">
              {[
                "Validation de la commande par l'atelier",
                "Confection et couture à la main",
                "Expédition avec suivi jusqu'à votre porte — paiement à la livraison",
              ].map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cocoa-800 text-[11px] font-semibold text-sand-100">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/espace-client" className="btn-primary">
              Suivre ma commande <IconArrow size={15} />
            </Link>
            <Link to="/boutique" className="btn-ghost">
              Continuer mes achats
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  /* ------- panier vide ------- */
  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-28 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-sand-300 text-cocoa-500">
          <IconBag size={30} />
        </span>
        <h1 className="font-display mt-6 text-4xl font-semibold text-cocoa-900 italic">
          Rien à finaliser pour l'instant
        </h1>
        <p className="mt-3 text-cocoa-500">Ajoutez un modèle ou créez une pièce sur mesure.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/boutique" className="btn-primary">Voir la boutique</Link>
          <Link to="/sur-mesure" className="btn-ghost">Créer sur mesure</Link>
        </div>
      </div>
    );
  }

  const pay = PAYMENTS.find((p) => p.id === payment)!;

  const submit = async () => {
    setError(null);
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError("Nom, téléphone et adresse de livraison sont nécessaires pour la commande.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setProcessing(true);
    try {
      const shipping_address = form.city.trim()
        ? `${form.address.trim()}, ${form.city.trim()}`
        : form.address.trim();
      const notePrefix = `Paiement à la livraison — ${pay.name}.`;
      const notes = form.note?.trim() ? `${notePrefix} ${form.note.trim()}` : notePrefix;

      const customItem = cart.find((i) => i.kind === "custom" && i.custom);
      let order: ApiOrder;

      if (customItem?.custom) {
        const c = customItem.custom;
        const measurements: Record<string, number> = {};
        for (const [k, v] of Object.entries(c.measurements)) {
          const n = parseFloat(v);
          if (!Number.isNaN(n)) measurements[k] = n;
        }
        const fabricSourceMap: Record<string, "maison" | "envoi_photo" | "conseil_atelier"> = {
          maison: "maison",
          envoi: "envoi_photo",
          conseil: "conseil_atelier",
        };

        order = await createCustomOrder({
          customer_name: form.name.trim(),
          customer_phone: form.phone.trim(),
          customer_email: form.email.trim() || undefined,
          shipping_address,
          total_amount: cartTotal,
          measurements,
          fabric_source: fabricSourceMap[c.fabricSource],
          notes,
        });
      } else {
        order = await createOrder({
          customer_name: form.name.trim(),
          customer_phone: form.phone.trim(),
          customer_email: form.email.trim() || undefined,
          total_amount: cartTotal,
          shipping_address,
          notes,
        });
      }

      clearCart();
      setPlaced(order);
      toast(`Commande ${order.order_number} confirmée — reçu envoyé`);
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (e) {
      setError(
        e instanceof ABMCYApiError
          ? e.message
          : "Une erreur est survenue lors de l'envoi de la commande. Votre panier a été conservé, réessayez."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pt-14 lg:px-8">
      <p className="eyebrow">Dernière ligne droite</p>
      <h1 className="font-display mt-3 text-5xl leading-[0.95] font-semibold text-cocoa-900 sm:text-6xl">
        Finaliser la <em className="text-cognac-600">commande</em>
      </h1>

      {error && (
        <p className="mt-8 border-l-2 border-cognac-600 bg-cognac-500/10 px-5 py-4 text-sm text-cognac-700">
          {error}
        </p>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
        <div className="min-w-0 space-y-10">
          {/* livraison */}
          <Reveal>
            <section className="border border-sand-300/80 bg-sand-50/70 p-7 sm:p-9">
              <h2 className="font-display flex items-baseline gap-4 text-3xl font-semibold text-cocoa-900">
                <span className="font-display text-lg text-cognac-600 italic">01</span> Livraison
              </h2>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="label">Nom complet *</label>
                  <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ex : Awa Ndiaye" />
                </div>
                <div>
                  <label className="label">Téléphone *</label>
                  <input className="field" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+221 77 000 00 00" />
                </div>
                <div>
                  <label className="label">Adresse e-mail</label>
                  <input className="field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="vous@exemple.sn" />
                </div>
                <div>
                  <label className="label">Ville</label>
                  <input className="field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Dakar" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Adresse de livraison *</label>
                  <input className="field" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Villa, rue, quartier, repère…" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Note pour le livreur</label>
                  <textarea className="field min-h-20 resize-y" value={form.note ?? ""} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Portail vert, appeler en arrivant…" />
                </div>
              </div>
            </section>
          </Reveal>

          {/* paiement */}
          <Reveal delay={120}>
            <section className="border border-sand-300/80 bg-sand-50/70 p-7 sm:p-9">
              <h2 className="font-display flex items-baseline gap-4 text-3xl font-semibold text-cocoa-900">
                <span className="font-display text-lg text-cognac-600 italic">02</span> Paiement
              </h2>
              <p className="mt-3 text-sm text-cocoa-600">
                Paiement à la livraison — indiquez votre moyen préféré, le livreur s'en occupera.
              </p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {PAYMENTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPayment(p.id)}
                    className={`flex cursor-pointer items-center gap-4 border p-4 text-left transition-all duration-300 ${
                      payment === p.id
                        ? "border-cocoa-800 bg-cocoa-800 text-sand-100 shadow-[0_16px_36px_-16px_rgba(46,31,19,0.55)]"
                        : "border-sand-300 bg-sand-50 hover:border-cocoa-800"
                    }`}
                  >
                    <span
                      className={`grid h-11 w-14 shrink-0 place-items-center rounded-[5px] text-[10px] font-bold tracking-wide ${
                        payment === p.id ? "bg-sand-100" : "text-sand-50"
                      }`}
                      style={{ background: payment === p.id ? undefined : p.color, color: payment === p.id ? p.color : undefined }}
                    >
                      {p.id === "card" ? "CB" : p.id === "om" ? "OM" : p.id === "free" ? "FREE" : p.name.slice(0, 4).toUpperCase()}
                    </span>
                    <span>
                      <span className="block text-[15px] font-semibold">{p.name}</span>
                      <span className={`block text-[11.5px] ${payment === p.id ? "text-sand-300" : "text-cocoa-500"}`}>
                        {p.tag}
                      </span>
                    </span>
                    {payment === p.id && (
                      <span className="ml-auto text-cognac-300"><IconCheck size={18} /></span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6 border border-sand-300/80 bg-sand-100/70 p-5">
                <p className="text-sm text-cocoa-700">
                  Vous réglerez <strong>{fmtPrice(cartTotal)}</strong> directement au livreur, en {pay.name.toLowerCase()}, à la réception de votre commande.
                </p>
              </div>
            </section>
          </Reveal>
        </div>

        {/* ---- résumé ---- */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-sand-300/80 bg-sand-50/80 p-7">
            <h2 className="font-display text-2xl font-semibold text-cocoa-900">Votre sélection</h2>
            <ul className="mt-5 divide-y divide-sand-300/60">
              {cart.map((i) => (
                <li key={i.key} className="flex items-center gap-4 py-4">
                  <div className="h-16 w-13 shrink-0 overflow-hidden rounded-[5px] border border-sand-300/70 bg-sand-200">
                    {i.image && <img src={i.image} alt="" className="h-full w-full object-cover object-top" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display truncate text-[15px] font-semibold text-cocoa-900">{i.name}</p>
                    {i.detail && <p className="truncate text-[11.5px] text-cocoa-500">{i.detail}</p>}
                    <p className="text-[11.5px] text-cocoa-500">Qté {i.qty}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-cocoa-900">{fmtPrice(i.price * i.qty)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 border-t border-sand-300/70 pt-4 text-sm">
              <div className="flex justify-between text-cocoa-500">
                <span>Sous-total</span>
                <span>{fmtPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-cocoa-500">
                <span>Livraison</span>
                <span className="text-cognac-600">Offerte</span>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <span className="text-[12px] font-medium tracking-[0.22em] text-cocoa-700 uppercase">Total</span>
                <span className="font-display text-4xl font-semibold text-cocoa-900">{fmtPrice(cartTotal)}</span>
              </div>
            </div>
            <button onClick={submit} disabled={processing} className="btn-primary mt-6 w-full disabled:cursor-wait disabled:opacity-80">
              {processing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-sand-100/40 border-t-sand-100" />
                  Envoi de la commande…
                </>
              ) : (
                <>
                  Confirmer — paiement à la livraison <IconArrow size={15} />
                </>
              )}
            </button>
            <p className="mt-4 text-center text-[11.5px] leading-relaxed text-cocoa-500">
              Confirmation automatique par e-mail.
              <br />
              Retouches incluses sous 15 jours.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

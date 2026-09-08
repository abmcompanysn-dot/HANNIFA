import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ORDER_STAGES, fmtPrice } from "../data/catalog";
import {
  listOrders,
  loginCustomer,
  registerCustomer,
  setToken,
  clearToken,
  isAuthenticated,
  formatDate,
  ABMCYApiError,
  type Order as ApiOrder,
} from "../services/abmcy";
import { MaskLines, Reveal } from "../components/Reveal";
import {
  IconBag,
  IconCheck,
  IconChevron,
  IconClock,
  IconMail,
  IconWhatsApp,
} from "../components/Icons";

const BADGE: Record<ApiOrder["status"], string> = {
  pending: "border-cognac-500/50 bg-cognac-500/12 text-cognac-700",
  confirmed: "border-cognac-500/50 bg-cognac-500/12 text-cognac-700",
  paid: "border-cocoa-800/30 bg-cocoa-800/8 text-cocoa-800",
  making: "border-[#31405c]/35 bg-[#31405c]/10 text-[#31405c]",
  shipped: "border-[#31405c]/35 bg-[#31405c]/10 text-[#31405c]",
  delivered: "border-[#5f7a52]/40 bg-[#5f7a52]/12 text-[#4a6340]",
  cancelled: "border-cognac-700/40 bg-cognac-700/10 text-cognac-800",
};

/** Fait correspondre le statut réel de la commande (API) à l'étape visuelle ORDER_STAGES. */
function stageFor(status: ApiOrder["status"]): number {
  switch (status) {
    case "pending":
      return 0;
    case "confirmed":
    case "paid":
      return 1;
    case "making":
      return 2;
    case "shipped":
      return 3;
    case "delivered":
      return 4;
    case "cancelled":
      return 0;
    default:
      return 0;
  }
}

function Timeline({ stage, cancelled }: { stage: number; cancelled?: boolean }) {
  if (cancelled) {
    return (
      <p className="border border-cognac-500/40 bg-cognac-500/10 px-4 py-3 text-sm text-cognac-700">
        Cette commande a été annulée.
      </p>
    );
  }
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

function LoginForm({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!phone.trim() || !password.trim()) {
      setError("Indiquez votre numéro de téléphone et votre mot de passe.");
      return;
    }
    setLoading(true);
    try {
      const { token } = mode === "login" ? await loginCustomer(phone.trim(), password) : await registerCustomer(phone.trim(), password);
      setToken(token);
      onLoggedIn();
    } catch (e) {
      setError(
        e instanceof ABMCYApiError
          ? e.message
          : "Connexion impossible pour le moment, réessayez."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-14 max-w-md border border-sand-300/80 bg-sand-50/70 p-8">
      <h2 className="font-display text-2xl font-semibold text-cocoa-900">
        {mode === "login" ? "Connexion à votre espace" : "Créer votre espace client"}
      </h2>
      <p className="mt-2 text-sm text-cocoa-500">
        {mode === "login"
          ? "Retrouvez l'historique et le suivi de vos commandes HANI'S."
          : "Un compte existe déjà après votre première commande — définissez un mot de passe pour y accéder."}
      </p>

      {error && (
        <p className="mt-5 border-l-2 border-cognac-600 bg-cognac-500/10 px-4 py-3 text-sm text-cognac-700">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-4">
        <div>
          <label className="label">Numéro de téléphone</label>
          <input
            className="field"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+221 77 000 00 00"
          />
        </div>
        <div>
          <label className="label">Mot de passe</label>
          <input
            className="field"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>

      <button onClick={submit} disabled={loading} className="btn-primary mt-6 w-full disabled:cursor-wait disabled:opacity-80">
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-sand-100/40 border-t-sand-100" />
        ) : mode === "login" ? (
          "Se connecter"
        ) : (
          "Créer mon compte"
        )}
      </button>

      <button
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError(null);
        }}
        className="mt-4 w-full cursor-pointer text-center text-[12.5px] text-cognac-600 underline-offset-4 hover:underline"
      >
        {mode === "login" ? "Pas encore de compte ? Créez-en un" : "Déjà un compte ? Connectez-vous"}
      </button>
    </div>
  );
}

export default function EspaceClient() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    listOrders()
      .then((list) => {
        if (cancelled) return;
        setOrders(list);
        setOpenId(list[0]?.id ?? null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof ABMCYApiError ? e.message : "Impossible de charger vos commandes pour le moment.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authed]);

  const logout = () => {
    clearToken();
    setAuthed(false);
    setOrders([]);
  };

  if (!authed) {
    return (
      <div className="mx-auto max-w-5xl px-5 pt-14 pb-24 lg:px-8">
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
        <LoginForm onLoggedIn={() => setAuthed(true)} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 pt-14 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
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
        </div>
        <button onClick={logout} className="btn-ghost !py-3">
          Se déconnecter
        </button>
      </div>
      <Reveal delay={180}>
        <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-cocoa-700">
          Historique complet et avancement en temps réel de vos commandes. Chaque
          confirmation est envoyée automatiquement par e-mail.
        </p>
      </Reveal>

      {loading && (
        <div className="mt-16 text-center">
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-sand-300 border-t-cognac-600" />
          <p className="mt-4 text-sm text-cocoa-500">Chargement de vos commandes…</p>
        </div>
      )}

      {!loading && error && (
        <div className="mt-16 text-center">
          <p className="font-display text-2xl text-cocoa-800 italic">Impossible de charger vos commandes</p>
          <p className="mt-3 text-sm text-cognac-700">{error}</p>
        </div>
      )}

      {/* commandes */}
      {!loading && !error && (
        orders.length === 0 ? (
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
              const stage = stageFor(o.status);
              const cancelled = o.status === "cancelled";
              const open = openId === o.id;
              const date = formatDate(o.created_at);

              return (
                <Reveal key={o.id}>
                  <div className="border border-sand-300/80 bg-sand-50/70 transition-shadow duration-400 hover:shadow-[0_20px_50px_-24px_rgba(60,42,27,0.4)]">
                    <button
                      onClick={() => setOpenId(open ? null : o.id)}
                      className="flex w-full cursor-pointer flex-wrap items-center gap-x-6 gap-y-3 px-7 py-6 text-left"
                    >
                      <div className="min-w-0">
                        <p className="font-display text-2xl leading-tight font-semibold text-cocoa-900">{o.order_number}</p>
                        <p className="mt-0.5 flex items-center gap-2 text-[12px] text-cocoa-500">
                          <IconClock size={13} /> Passée le {date}
                        </p>
                      </div>
                      <span className={`border px-3 py-1.5 text-[10.5px] font-semibold tracking-[0.14em] uppercase ${BADGE[o.status]}`}>
                        {cancelled ? "Annulée" : ORDER_STAGES[stage].label}
                      </span>
                      <span className="ml-auto flex items-center gap-5">
                        <span className="font-display text-2xl font-semibold text-cocoa-900">{fmtPrice(o.total_amount)}</span>
                        <IconChevron size={18} className={`text-cocoa-500 transition-transform duration-400 ${open ? "rotate-180" : ""}`} />
                      </span>
                    </button>

                    {open && (
                      <div className="border-t border-sand-300/70 px-7 py-7">
                        {/* avancement */}
                        <p className="label">Avancement de la confection</p>
                        <Timeline stage={stage} cancelled={cancelled} />
                        {!cancelled && (
                          <p className="mt-4 flex items-center gap-2 text-[12px] text-cocoa-500">
                            <IconCheck size={14} className="text-cognac-600" />
                            Confirmation automatique envoyée par e-mail à chaque étape.
                          </p>
                        )}

                        {/* détails */}
                        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
                          <div className="space-y-5">
                            {o.notes && (
                              <div>
                                <p className="label">Notes</p>
                                <p className="text-sm leading-relaxed text-cocoa-700">{o.notes}</p>
                              </div>
                            )}
                            {o.measurements && Object.keys(o.measurements).length > 0 && (
                              <div>
                                <p className="label">Mesures transmises</p>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(o.measurements).map(([k, v]) => (
                                    <span key={k} className="border border-sand-300 bg-sand-100/80 px-3 py-1.5 text-[12px] text-cocoa-700">
                                      {k} : <strong className="font-semibold">{v} cm</strong>
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
                                {o.customer_name}
                                <br />
                                {o.shipping_address}
                                <br />
                                {o.customer_phone}
                              </p>
                            </div>
                            {o.customer_email && (
                              <p className="flex items-center gap-2 text-sm text-cocoa-700">
                                <IconMail size={15} className="text-cognac-600" /> {o.customer_email}
                              </p>
                            )}
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
                      </div>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        )
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

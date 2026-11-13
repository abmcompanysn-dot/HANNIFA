import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ORDER_STAGES, fmtPrice } from "../data/catalog";
import {
  listOrders,
  loginCustomer,
  registerCustomer,
  forgotCustomerPassword,
  resetCustomerPassword,
  getCustomerProfile,
  updateCustomerProfile,
  setToken,
  clearToken,
  isAuthenticated,
  formatDate,
  ABMCYApiError,
  type Order as ApiOrder,
  type Customer as ApiCustomer,
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
      <p className="rounded-3xl border border-cognac-500/40 bg-cognac-500/10 px-4 py-3 text-sm text-cognac-700">
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

type Mode = "login" | "register" | "forgot" | "reset";

/** Jeton du lien « Choisir mon mot de passe » reçu par email (?reset_token=…). */
function readResetToken(): string {
  try {
    return new URLSearchParams(window.location.search).get("reset_token") ?? "";
  } catch {
    return "";
  }
}

function clearResetToken() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete("reset_token");
    window.history.replaceState(null, "", url.toString());
  } catch {
    /* rien */
  }
}

const PASSWORD_RULE = "8 caractères minimum, avec au moins une lettre et un chiffre.";
const passwordOk = (pw: string) => pw.length >= 8 && /[A-Za-zÀ-ÿ]/.test(pw) && /\d/.test(pw);

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          className="field !pr-20"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-[11px] font-medium tracking-[0.14em] text-cognac-600 uppercase"
        >
          {show ? "Masquer" : "Afficher"}
        </button>
      </div>
    </div>
  );
}

function AccountForm({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [resetToken] = useState(readResetToken);
  const [mode, setMode] = useState<Mode>(resetToken ? "reset" : "login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const go = (m: Mode) => {
    setMode(m);
    setError(null);
    setNotice(null);
    setPassword("");
    setConfirm("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (mode === "login" && (!identifier.trim() || !password)) {
      return setError("Indiquez votre numéro (ou email) et votre mot de passe.");
    }
    if (mode === "register") {
      if (!name.trim() || !phone.trim()) return setError("Indiquez votre nom et votre numéro de téléphone.");
      if (email.trim() && !email.includes("@")) return setError("Adresse email invalide.");
    }
    if (mode === "register" || mode === "reset") {
      if (!passwordOk(password)) return setError(`Mot de passe trop simple : ${PASSWORD_RULE}`);
      if (password !== confirm) return setError("Les deux mots de passe ne sont pas identiques.");
    }
    if (mode === "forgot" && !identifier.trim()) {
      return setError("Indiquez le numéro ou l'email de votre compte.");
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const { token } = await loginCustomer(identifier.trim(), password);
        setToken(token);
        onLoggedIn();
      } else if (mode === "register") {
        const { token } = await registerCustomer({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          password,
        });
        setToken(token);
        onLoggedIn();
      } else if (mode === "forgot") {
        const r = await forgotCustomerPassword(identifier.trim());
        setNotice(r.message || "Si un compte correspond, un lien vient d'être envoyé par email.");
      } else {
        await resetCustomerPassword(resetToken, password);
        clearResetToken();
        go("login");
        setNotice("Mot de passe enregistré. Connectez-vous avec votre numéro (ou email) et ce nouveau mot de passe.");
      }
    } catch (err) {
      setError(err instanceof ABMCYApiError ? err.message : "Connexion impossible pour le moment, réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<Mode, [string, string]> = {
    login: ["Connexion à votre espace", "Suivez vos commandes, retrouvez vos mesures et commandez plus vite."],
    register: ["Créer votre compte", "En une minute. Vos commandes déjà passées avec ce numéro y apparaîtront automatiquement."],
    forgot: ["Mot de passe oublié", "Nous envoyons un lien pour en choisir un nouveau à l'email de votre compte."],
    reset: ["Nouveau mot de passe", "Choisissez votre nouveau mot de passe."],
  };
  const submitLabel: Record<Mode, string> = {
    login: "Se connecter",
    register: "Créer mon compte",
    forgot: "Envoyer le lien",
    reset: "Enregistrer le mot de passe",
  };

  return (
    <div className="mx-auto mt-14 max-w-md">
      {(mode === "login" || mode === "register") && (
        <div className="grid grid-cols-2 border border-sand-300/80 bg-sand-50/60 p-1" role="tablist">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => go(m)}
              className={`cursor-pointer py-3 text-[11.5px] font-semibold tracking-[0.18em] uppercase transition-colors ${
                mode === m ? "bg-cocoa-800 text-sand-100" : "text-cocoa-700 hover:text-cognac-600"
              }`}
            >
              {m === "login" ? "J'ai un compte" : "Nouvelle cliente"}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={submit}
        className="mt-4 border border-sand-300/80 bg-gradient-to-br from-sand-50/95 via-sand-50/80 to-sand-200/60 p-8 shadow-[0_30px_70px_-40px_rgba(60,42,27,0.55)]"
      >
        <h2 className="font-display text-2xl font-semibold text-cocoa-900">{titles[mode][0]}</h2>
        <p className="mt-2 text-sm text-cocoa-500">{titles[mode][1]}</p>

        {error && (
          <p className="rounded-3xl mt-5 border border-cognac-500/30 bg-cognac-500/10 px-4 py-3 text-sm text-cognac-700" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="mt-5 border-l-2 border-[#5f7a52] bg-[#5f7a52]/10 px-4 py-3 text-sm text-[#4a6340]" role="status">
            {notice}
          </p>
        )}

        <div className="mt-6 space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label className="label">Nom complet</label>
                <input className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="ex : Awa Ndiaye" />
              </div>
              <div>
                <label className="label">Numéro de téléphone</label>
                <input className="field" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="77 000 00 00" />
              </div>
              <div>
                <label className="label">Email (pour retrouver votre mot de passe)</label>
                <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="vous@exemple.com" />
              </div>
            </>
          )}

          {(mode === "login" || mode === "forgot") && (
            <div>
              <label className="label">Numéro de téléphone ou email</label>
              <input
                className="field"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                placeholder="77 000 00 00 ou vous@exemple.com"
              />
            </div>
          )}

          {mode !== "forgot" && (
            <PasswordField
              label={mode === "login" ? "Mot de passe" : "Choisissez un mot de passe"}
              value={password}
              onChange={setPassword}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          )}
          {(mode === "register" || mode === "reset") && (
            <>
              <PasswordField label="Confirmez le mot de passe" value={confirm} onChange={setConfirm} autoComplete="new-password" />
              <p className={`text-[12px] ${password && !passwordOk(password) ? "text-cognac-700" : "text-cocoa-500"}`}>{PASSWORD_RULE}</p>
            </>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary mt-6 w-full disabled:cursor-wait disabled:opacity-80">
          {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-sand-100/40 border-t-sand-100" /> : submitLabel[mode]}
        </button>

        <div className="mt-5 flex flex-wrap justify-between gap-3 text-[12.5px]">
          {mode === "login" && (
            <button type="button" onClick={() => go("forgot")} className="cursor-pointer text-cognac-600 underline-offset-4 hover:underline">
              Mot de passe oublié ?
            </button>
          )}
          {(mode === "forgot" || mode === "reset") && (
            <button type="button" onClick={() => go("login")} className="cursor-pointer text-cognac-600 underline-offset-4 hover:underline">
              Retour à la connexion
            </button>
          )}
          <a href="https://wa.me/22675544742" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-cocoa-500 hover:text-cognac-600">
            <IconWhatsApp size={14} /> Besoin d'aide ?
          </a>
        </div>
      </form>

      {mode === "register" && (
        <ul className="mt-6 grid gap-2 text-[13px] text-cocoa-700">
          {["Suivez chaque étape de la confection", "Vos coordonnées remplies à chaque commande", "Votre historique et vos mesures au même endroit"].map((t) => (
            <li key={t} className="flex items-center gap-2.5">
              <IconCheck size={14} className="text-cognac-600" /> {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Fiche « Mon compte » : nom, email et adresse de livraison modifiables. */
function ProfileCard() {
  const [profile, setProfile] = useState<ApiCustomer | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "", shipping_address: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCustomerProfile()
      .then((p) => !cancelled && setProfile(p))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!profile) return null;

  const start = () => {
    setDraft({ name: profile.name ?? "", email: profile.email ?? "", shipping_address: profile.shipping_address ?? "" });
    setMsg(null);
    setEditing(true);
  };
  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const p = await updateCustomerProfile({
        name: draft.name.trim(),
        email: draft.email.trim(),
        shipping_address: draft.shipping_address.trim(),
      });
      setProfile(p);
      setEditing(false);
      setMsg({ ok: true, text: "Vos informations sont enregistrées." });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof ABMCYApiError ? e.message : "Enregistrement impossible, réessayez." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Reveal className="mt-10">
      <div className="rounded-3xl border border-sand-300/80 bg-gradient-to-br from-sand-50/95 to-sand-200/50 px-7 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Mon compte</p>
            <p className="font-display mt-1 text-2xl font-semibold text-cocoa-900">Bonjour {profile.name?.split(" ")[0] || ""}</p>
          </div>
          {!editing && (
            <button onClick={start} className="btn-ghost !py-2.5 !text-[11px]">
              Modifier mes informations
            </button>
          )}
        </div>
        {!editing ? (
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="label !mb-1">Téléphone</dt>
              <dd className="text-cocoa-800">{profile.phone}</dd>
            </div>
            <div>
              <dt className="label !mb-1">Email</dt>
              <dd className="break-all text-cocoa-800">{profile.email || <span className="text-cognac-700">À ajouter (pour le mot de passe oublié)</span>}</dd>
            </div>
            <div>
              <dt className="label !mb-1">Adresse de livraison</dt>
              <dd className="text-cocoa-800">{profile.shipping_address || "—"}</dd>
            </div>
          </dl>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nom complet</label>
              <input className="field" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="field" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Adresse de livraison</label>
              <input className="field" value={draft.shipping_address} onChange={(e) => setDraft({ ...draft, shipping_address: e.target.value })} placeholder="Quartier, rue, ville" />
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <button onClick={save} disabled={saving} className="btn-primary !py-3 disabled:opacity-70">
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
              <button onClick={() => setEditing(false)} className="btn-ghost !py-3">
                Annuler
              </button>
            </div>
          </div>
        )}
        {msg && <p className={`mt-4 text-sm ${msg.ok ? "text-[#4a6340]" : "text-cognac-700"}`}>{msg.text}</p>}
      </div>
    </Reveal>
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
        <AccountForm onLoggedIn={() => setAuthed(true)} />
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

      <ProfileCard />

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
          <div className="rounded-3xl mt-16 border border-dashed border-sand-400 px-8 py-20 text-center">
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
                                    <span key={k} className="rounded-full border border-sand-300 bg-sand-100/80 px-3 py-1.5 text-[12px] text-cocoa-700">
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
                              href="https://wa.me/22675544742"
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-3xl flex items-center gap-3 border border-sand-300 px-4 py-3 text-sm text-cocoa-700 transition-colors hover:border-cognac-500 hover:text-cognac-600"
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
        <div className="rounded-3xl flex flex-col items-start justify-between gap-6 bg-cocoa-800 px-8 py-9 text-sand-100 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow !text-cognac-300">L'atelier reste à vos côtés</p>
            <p className="font-display mt-2 text-2xl font-medium sm:text-3xl">
              Retouches incluses sous 15 jours après livraison.
            </p>
          </div>
          <a href="https://wa.me/22675544742" target="_blank" rel="noreferrer" className="btn-light shrink-0">
            <IconWhatsApp size={16} /> Écrire à l'atelier
          </a>
        </div>
      </Reveal>
    </div>
  );
}

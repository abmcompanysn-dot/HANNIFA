import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "./Header";
import {
  IconArrow,
  IconCheck,
  IconGlobe,
  IconInstagram,
  IconMail,
  IconPhone,
  IconPin,
  IconSnapchat,
  IconTikTok,
  IconWhatsApp,
} from "./Icons";
import { SOCIALS } from "../data/catalog";

const SOCIAL_ICONS: Record<string, (p: { size?: number }) => ReactNode> = {
  instagram: (p) => <IconInstagram {...p} />,
  tiktok: (p) => <IconTikTok {...p} />,
  snapchat: (p) => <IconSnapchat {...p} />,
  website: (p) => <IconGlobe {...p} />,
  whatsapp: (p) => <IconWhatsApp {...p} />,
  whatsapp2: (p) => <IconWhatsApp {...p} />,
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const onSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim().length > 3) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="relative mt-28 overflow-hidden bg-cocoa-900 text-sand-200">
      {/* photo de fond — léger voile pour garder le texte lisible sans trop assombrir la photo */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-55"
        style={{
          backgroundImage:
            "url(https://abmcy.mahu.cards/c5a72dc0-54c9-4f3a-aa76-67a013e265f9/7d31843f-e081-4cae-92e3-d693f70443ac-ab14ef86-71bc-4267-ba9a-0c97638f5af6.jpg)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cocoa-900/80 via-cocoa-900/70 to-cocoa-900/85" />

      {/* liseré décoratif */}
      <div className="relative flex items-center gap-4 overflow-hidden px-8 pt-10">
        <div className="h-px flex-1 bg-sand-100/15" />
        <span className="font-display text-lg tracking-[0.5em] text-cognac-300 italic">HANI&rsquo;S</span>
        <div className="h-px flex-1 bg-sand-100/15" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1.1fr] lg:px-8">
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-sand-300">
            Maison de couture basée à Bobo-Dioulasso. Pièces d'exception, confection sur mesure et
            savoir-faire transmis de mère en fille.
          </p>
          <div className="mt-6 flex gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.id}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                title={s.label}
                className="grid h-11 w-11 place-items-center rounded-full border border-sand-100/20 text-sand-200 transition-all duration-300 hover:-translate-y-1 hover:border-cognac-300 hover:text-cognac-300"
              >
                {SOCIAL_ICONS[s.id]({ size: 18 })}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="eyebrow mb-5 !text-cognac-300">Navigation</h3>
          <ul className="space-y-3 text-sm">
            {[
              { to: "/boutique", label: "Toute la boutique" },
              { to: "/sur-mesure", label: "Commande sur mesure" },
              { to: "/galerie", label: "Galerie de réalisations" },
              { to: "/espace-client", label: "Espace client & suivi" },
              { to: "/commander", label: "Finaliser une commande" },
            ].map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="group inline-flex items-center gap-2 text-sand-300 transition-colors hover:text-cognac-300"
                >
                  <span className="h-px w-0 bg-cognac-300 transition-all duration-300 group-hover:w-4" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow mb-5 !text-cognac-300">Collections</h3>
          <ul className="space-y-3 text-sm">
            {[
              { to: "/boutique/femme", label: "Femme — Robes" },
              { to: "/boutique/femme", label: "Femme — Ensembles" },
              { to: "/boutique/femme", label: "Habits de prière" },
              { to: "/boutique/homme", label: "Homme — Ensembles" },
              { to: "/boutique/homme", label: "Homme — Chemises" },
            ].map((l, i) => (
              <li key={i}>
                <Link
                  to={l.to}
                  className="group inline-flex items-center gap-2 text-sand-300 transition-colors hover:text-cognac-300"
                >
                  <span className="h-px w-0 bg-cognac-300 transition-all duration-300 group-hover:w-4" />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow mb-5 !text-cognac-300">L'atelier</h3>
          <ul className="space-y-3.5 text-sm text-sand-300">
            <li className="flex items-start gap-3">
              <IconPin size={17} className="mt-0.5 shrink-0 text-cognac-300" />
              Bobo-Dioulasso, Burkina Faso
            </li>
            <li className="flex items-center gap-3">
              <IconPhone size={17} className="shrink-0 text-cognac-300" />
              <a href="tel:+22675544742" className="transition-colors hover:text-cognac-300">
                +226 75 54 47 42
              </a>
            </li>
            <li className="flex items-center gap-3">
              <IconMail size={17} className="shrink-0 text-cognac-300" />
              <a href="mailto:hanifahkone9@gmail.com" className="transition-colors hover:text-cognac-300">
                hanifahkone9@gmail.com
              </a>
            </li>
          </ul>

          <div className="mt-7">
            <p className="mb-3 text-[11px] uppercase tracking-[0.24em] text-sand-300">
              Les nouveautés en avant-première
            </p>
            {subscribed ? (
              <p className="flex items-center gap-2 bg-cocoa-800 px-4 py-3 text-sm text-cognac-300">
                <IconCheck size={16} /> Merci, vous êtes sur la liste !
              </p>
            ) : (
              <form onSubmit={onSubscribe} className="flex">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse e-mail"
                  className="w-full min-w-0 border border-sand-100/20 bg-cocoa-800 px-4 py-3 text-sm text-sand-100 outline-none placeholder:text-sand-300/50 focus:border-cognac-300"
                />
                <button
                  type="submit"
                  aria-label="S'inscrire"
                  className="grid w-12 shrink-0 cursor-pointer place-items-center bg-cognac-500 text-cocoa-950 transition-colors hover:bg-cognac-300"
                >
                  <IconArrow size={17} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* moyens de paiement */}
      <div className="border-t border-sand-100/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-6 sm:flex-row lg:px-8">
          <p className="text-[11px] uppercase tracking-[0.22em] text-sand-300">Paiement sécurisé</p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="rounded-[5px] bg-[#1b9cd8] px-3 py-1.5 text-[11px] font-semibold tracking-wide text-sand-50">
              Wave
            </span>
            <span className="rounded-[5px] bg-[#e8710a] px-3 py-1.5 text-[11px] font-semibold tracking-wide text-sand-50">
              Orange Money
            </span>
            <span className="rounded-[5px] bg-[#d42b2b] px-3 py-1.5 text-[11px] font-semibold tracking-wide text-sand-50">
              Free Money
            </span>
            <span className="rounded-[5px] border border-sand-100/25 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-sand-200">
              VISA
            </span>
            <span className="rounded-[5px] border border-sand-100/25 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-sand-200">
              Mastercard
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-sand-100/10 py-5 text-center text-[12px] tracking-wide text-sand-300/70">
        © {new Date().getFullYear()} HANI&rsquo;S — Tous droits réservés · Cousu main à Bobo-Dioulasso
        <span className="mx-2 text-cognac-300">✦</span>
        Élégance, confiance, savoir-faire
      </div>
    </footer>
  );
}

import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { IconBag, IconClose, IconMenu, IconSparkle, IconUser, IconWhatsApp } from "./Icons";
import { SOCIALS } from "../data/catalog";

/** La marque : l'emblème de la maison, son nom en capitales espacées et
 * sa devise (« Élégance & modestie », celle de son logo). `compact` replie
 * la devise ; `animated` fait monter les lettres une à une au chargement. */
export function Logo({
  light = false,
  compact = false,
  animated = false,
}: {
  light?: boolean;
  compact?: boolean;
  animated?: boolean;
}) {
  return (
    <Link to="/" className="group inline-flex shrink-0 items-center gap-3" aria-label="HANI'S — accueil">
      <span
        className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full ring-1 transition-all duration-700 group-hover:ring-cognac-500 ${
          compact ? "h-9 w-9" : "h-11 w-11"
        } ${light ? "ring-sand-100/30" : "ring-cognac-500/45"}`}
      >
        <img
          src="/logo-hanis.jpg"
          alt=""
          className="h-full w-full scale-[1.35] object-cover transition-transform duration-700 group-hover:scale-[1.5]"
        />
      </span>
      <span className="leading-none">
        <span
          aria-hidden
          className={`font-display block font-semibold tracking-[0.26em] whitespace-nowrap transition-all duration-700 ${
            compact ? "text-[21px]" : "text-[24px]"
          } ${light ? "text-sand-100" : "text-cocoa-900"}`}
        >
          {"HANI\u2019S".split("").map((ch, i) => (
            <span key={i} className={animated ? "brand-letter" : "inline-block"} style={{ ["--i" as string]: i }}>
              {ch}
            </span>
          ))}
        </span>
        <span
          className="fold grid"
          style={{ gridTemplateRows: compact ? "0fr" : "1fr", opacity: compact ? 0 : 1 }}
        >
          <span
            className={`font-display block text-[12.5px] tracking-[0.05em] whitespace-nowrap italic ${animated ? "brand-tag" : ""} ${
              light ? "text-sand-300" : "text-cognac-600"
            }`}
          >
            <span className="block pt-1">Élégance &amp; modestie</span>
          </span>
        </span>
      </span>
    </Link>
  );
}

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/boutique", label: "Boutique" },
  { to: "/boutique/femme", label: "Femme" },
  { to: "/boutique/homme", label: "Homme" },
  { to: "/sur-mesure", label: "Sur mesure" },
  { to: "/galerie", label: "Galerie" },
];

const ANNOUNCES = [
  { long: "Confection sur mesure en 5 jours · Livraison partout au Sénégal", short: "Sur mesure · Confection 5 jours" },
  { long: "Acompte de 50 % à la commande · Solde à la livraison", short: "Acompte 50 % · Solde à la livraison" },
  { long: "Paiement Wave · Orange Money · Free Money", short: "Wave · Orange Money · Free Money" },
];

const ICON_BTN =
  "grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full text-cocoa-800 transition-all duration-300 hover:bg-cocoa-800 hover:text-sand-100";

export default function Header() {
  const { cartCount, setCartOpen } = useStore();
  const [scrolled, setScrolled] = useState(false);
  // Rétracté : en descendant la page, la capsule se replie en une petite
  // pilule (marque, panier, menu). Elle se redéploie dès qu'on remonte.
  const [retracted, setRetracted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [announce, setAnnounce] = useState(0);
  const location = useLocation();

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (y < 140) setRetracted(false);
      else if (y > last + 6) setRetracted(true);
      else if (y < last - 6) setRetracted(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setRetracted(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Le bandeau fait tourner trois messages (fixe si l'utilisateur a
  // demandé moins d'animations).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setAnnounce((n) => (n + 1) % ANNOUNCES.length), 4500);
    return () => window.clearInterval(id);
  }, []);

  const fold = (open: boolean) => ({ gridTemplateColumns: open ? "1fr" : "0fr", opacity: open ? 1 : 0 });

  return (
    <>
      {/* bandeau annonce */}
      <div className="relative z-[60] flex items-center justify-center gap-2.5 bg-cocoa-900 px-4 py-2 text-center text-[11px] uppercase tracking-[0.22em] text-sand-200">
        <IconSparkle size={11} className="shrink-0 text-cognac-300" />
        <span key={announce} className="announce-in">
          <span className="hidden sm:inline">{ANNOUNCES[announce].long}</span>
          <span className="sm:hidden">{ANNOUNCES[announce].short}</span>
        </span>
        <IconSparkle size={11} className="shrink-0 text-cognac-300" />
      </div>

      {/* capsule flottante */}
      <header className="header-in pointer-events-none sticky top-0 z-[55] px-3 pt-3 sm:px-5">
        <div
          className={`capsule pointer-events-auto mx-auto flex items-center justify-between gap-2 rounded-full border backdrop-blur-md ${
            retracted ? "py-1.5 pr-1.5 pl-2" : "py-2 pr-2.5 pl-3 lg:pr-3 lg:pl-4"
          } ${
            scrolled
              ? "border-cognac-500/30 bg-sand-50/90 shadow-[0_18px_50px_-22px_rgba(60,42,27,0.55)]"
              : "border-sand-300/70 bg-sand-50/65 shadow-[0_10px_34px_-24px_rgba(60,42,27,0.45)]"
          }`}
          style={{ maxWidth: retracted ? 292 : 1216 }}
        >
          <Logo compact={retracted} animated />

          {/* menu complet : ordinateur, capsule déployée */}
          <div className="fold hidden lg:grid" style={fold(!retracted)} aria-hidden={retracted}>
            <nav className="flex items-center gap-1 whitespace-nowrap">
              {NAV.slice(1).map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end
                  tabIndex={retracted ? -1 : undefined}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2.5 text-[11.5px] font-medium uppercase tracking-[0.18em] transition-all duration-400 ${
                      isActive
                        ? "bg-cocoa-800 text-sand-100"
                        : "text-cocoa-700 hover:bg-cognac-500/15 hover:text-cognac-700"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-0.5">
            <div className="fold grid" style={fold(!retracted)}>
              <Link to="/espace-client" aria-label="Espace client" tabIndex={retracted ? -1 : undefined} className={ICON_BTN}>
                <IconUser />
              </Link>
            </div>
            <button onClick={() => setCartOpen(true)} aria-label="Ouvrir le panier" className={`relative ${ICON_BTN}`}>
              <IconBag />
              {cartCount > 0 && (
                <span
                  key={cartCount}
                  className="announce-in absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-cognac-500 px-1 text-[10px] font-semibold text-sand-50"
                >
                  {cartCount}
                </span>
              )}
            </button>
            {/* bouton menu : toujours sur téléphone, et sur ordinateur quand la capsule est repliée */}
            <div className={retracted ? "" : "lg:hidden"}>
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Ouvrir le menu"
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-cocoa-800 text-sand-100 transition-all duration-300 hover:bg-cognac-600 active:scale-95"
              >
                <IconMenu />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* menu mobile */}
      <div
        className={`fixed inset-0 z-[85] transition-opacity duration-400 ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-cocoa-950/60" onClick={() => setMenuOpen(false)} />
        <div
          className={`absolute top-2 right-2 bottom-2 flex w-[88%] max-w-sm flex-col overflow-hidden rounded-[34px] bg-cocoa-900 text-sand-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            menuOpen ? "translate-x-0" : "translate-x-[105%]"
          }`}
        >
          <div className="flex items-center justify-between border-b border-sand-100/10 px-6 py-5">
            <span className="eyebrow !text-cognac-300">Menu</span>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Fermer le menu"
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-full transition-colors hover:bg-sand-100/10"
            >
              <IconClose />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-6 py-6">
            {NAV.map((n, i) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                style={{ transitionDelay: menuOpen ? `${120 + i * 60}ms` : "0ms" }}
                className={({ isActive }) =>
                  `font-display border-b border-sand-100/8 py-4 text-3xl font-medium transition-all duration-500 ${
                    menuOpen ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
                  } ${isActive ? "text-cognac-300 italic" : "text-sand-100 hover:text-cognac-300"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <NavLink
              to="/espace-client"
              className="mt-6 inline-flex items-center gap-3 self-start rounded-full bg-cognac-500 px-6 py-3.5 text-[12px] font-medium uppercase tracking-[0.22em] text-cocoa-950 transition-colors hover:bg-cognac-300"
            >
              <IconUser size={16} /> Espace client
            </NavLink>
          </nav>
          <div className="border-t border-sand-100/10 px-6 py-6">
            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-sand-300">Suivez la maison</p>
            <div className="flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-sand-100/20 transition-all hover:border-cognac-300 hover:text-cognac-300"
                >
                  {s.id === "instagram" && <SocialGlyph id={s.id} />}
                  {s.id === "tiktok" && <SocialGlyph id={s.id} />}
                  {s.id === "facebook" && <SocialGlyph id={s.id} />}
                  {s.id === "whatsapp" && <IconWhatsApp size={17} />}
                </a>
              ))}
            </div>
            <a
              href="https://wa.me/22675544742"
              target="_blank"
              rel="noreferrer"
              className="mt-5 flex items-center gap-3 text-sm text-sand-200 transition-colors hover:text-cognac-300"
            >
              <IconWhatsApp size={17} /> +226 75 54 47 42
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function SocialGlyph({ id }: { id: string }) {
  // lazy import-free re-render of social glyphs
  if (id === "instagram")
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="4" y="4" width="16" height="16" rx="4.5" />
        <circle cx="12" cy="12" r="3.6" />
        <circle cx="16.6" cy="7.4" r="0.5" fill="currentColor" />
      </svg>
    );
  if (id === "tiktok")
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M14.5 4v9.8a3.7 3.7 0 1 1-3.2-3.7" />
        <path d="M14.5 5.5c.6 2.4 2.3 4 4.9 4.3" />
      </svg>
    );
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M15.5 4h-2.4a3.4 3.4 0 0 0-3.4 3.4V10H7.2v3.2h2.5V20h3.3v-6.8h2.6l.6-3.2h-3.2V7.9c0-.8.4-1.3 1.4-1.3h1.7V4Z" />
    </svg>
  );
}

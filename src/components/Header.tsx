import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { IconBag, IconClose, IconMenu, IconSparkle, IconUser, IconWhatsApp } from "./Icons";
import { SOCIALS } from "../data/catalog";

/** La marque : l'emblème de la maison, son nom en capitales espacées et
 * sa devise (« Élégance & modestie », celle de son logo). `animated` fait
 * monter les lettres une à une au chargement (en-tête seulement). */
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
    <Link to="/" className="group inline-flex items-center gap-3.5" aria-label="HANI'S — accueil">
      <span
        className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full ring-1 ring-offset-2 transition-all duration-500 group-hover:ring-cognac-500 ${
          compact ? "h-10 w-10" : "h-12 w-12 lg:h-[54px] lg:w-[54px]"
        } ${light ? "ring-sand-100/30 ring-offset-cocoa-950" : "ring-cognac-500/45 ring-offset-sand-100"}`}
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
          className={`font-display block font-semibold tracking-[0.3em] transition-all duration-500 ${
            compact ? "text-[24px]" : "text-[27px] lg:text-[32px]"
          } ${light ? "text-sand-100" : "text-cocoa-900"}`}
        >
          {"HANI\u2019S".split("").map((ch, i) => (
            <span
              key={i}
              className={animated ? "brand-letter" : "inline-block"}
              style={{ ["--i" as string]: i }}
            >
              {ch}
            </span>
          ))}
        </span>
        <span className={`mt-1.5 flex items-center gap-2 ${animated ? "brand-tag" : ""}`}>
          <span className="stitch-line w-4 shrink-0 opacity-70" />
          <span
            className={`font-display text-[13px] tracking-[0.06em] whitespace-nowrap italic ${
              light ? "text-sand-300" : "text-cognac-600"
            }`}
          >
            Élégance &amp; modestie
          </span>
          <span className="stitch-line w-4 shrink-0 opacity-70" />
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
// Sur ordinateur, la marque est au centre (elle ramène à l'accueil) et le
// menu se partage de part et d'autre.
const NAV_LEFT = NAV.slice(1, 4);
const NAV_RIGHT = NAV.slice(4);

const ANNOUNCES = [
  { long: "Confection sur mesure en 5 jours · Livraison partout au Sénégal", short: "Sur mesure · Confection 5 jours" },
  { long: "Acompte de 50 % à la commande · Solde à la livraison", short: "Acompte 50 % · Solde à la livraison" },
  { long: "Paiement Wave · Orange Money · Free Money", short: "Wave · Orange Money · Free Money" },
];

function DeskLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `relative py-1.5 text-[12px] font-medium uppercase tracking-[0.2em] transition-colors duration-300 after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-cognac-500 after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-cognac-600 hover:after:scale-x-100 ${
          isActive ? "text-cognac-600 after:scale-x-100" : "text-cocoa-700"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function Header() {
  const { cartCount, setCartOpen } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [announce, setAnnounce] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

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

      <header
        className={`header-in sticky top-0 z-[55] transition-[background-color,box-shadow] duration-500 ${
          scrolled
            ? "bg-sand-100/92 shadow-[0_14px_44px_-20px_rgba(60,42,27,0.4)] backdrop-blur-md"
            : "bg-sand-50/55 backdrop-blur-sm"
        }`}
      >
        <div
          className={`mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-5 transition-[padding] duration-500 lg:grid-cols-[1fr_auto_1fr] lg:px-8 ${
            scrolled ? "py-2.5" : "py-3.5 lg:py-5"
          }`}
        >
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Boutique">
            {NAV_LEFT.map((n) => (
              <DeskLink key={n.to} {...n} />
            ))}
          </nav>

          <Logo compact={scrolled} animated />

          <div className="flex items-center justify-end gap-1.5">
            <nav className="mr-5 hidden items-center gap-8 lg:flex" aria-label="La maison">
              {NAV_RIGHT.map((n) => (
                <DeskLink key={n.to} {...n} />
              ))}
            </nav>
            <Link
              to="/espace-client"
              aria-label="Espace client"
              className="grid h-11 w-11 place-items-center rounded-full text-cocoa-800 transition-all duration-300 hover:bg-cocoa-800 hover:text-sand-100"
            >
              <IconUser />
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              aria-label="Ouvrir le panier"
              className="relative grid h-11 w-11 cursor-pointer place-items-center rounded-full text-cocoa-800 transition-all duration-300 hover:bg-cocoa-800 hover:text-sand-100"
            >
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
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              className="grid h-11 w-11 cursor-pointer place-items-center rounded-full text-cocoa-800 transition-colors hover:bg-cocoa-800 hover:text-sand-100 lg:hidden"
            >
              <IconMenu />
            </button>
          </div>
        </div>
        {/* bord cousu */}
        <div aria-hidden className={`stitch-line transition-opacity duration-500 ${scrolled ? "opacity-70" : "opacity-40"}`} />
      </header>

      {/* menu mobile */}
      <div
        className={`fixed inset-0 z-[85] transition-opacity duration-400 lg:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-cocoa-950/60" onClick={() => setMenuOpen(false)} />
        <div
          className={`absolute top-0 right-0 flex h-full w-[86%] max-w-sm flex-col bg-cocoa-900 text-sand-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            menuOpen ? "translate-x-0" : "translate-x-full"
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
              className="mt-6 inline-flex items-center gap-3 self-start bg-cognac-500 px-6 py-3.5 text-[12px] font-medium uppercase tracking-[0.22em] text-cocoa-950 transition-colors hover:bg-cognac-300"
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

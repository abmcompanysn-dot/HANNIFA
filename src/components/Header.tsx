import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { IconBag, IconClose, IconMenu, IconSparkle, IconUser, IconWhatsApp } from "./Icons";
import { SOCIALS } from "../data/catalog";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-3" aria-label="HANI'S — accueil">
      <span
        className={`grid h-11 w-11 place-items-center transition-colors duration-300 ${
          light ? "text-sand-100" : "text-cocoa-800"
        } group-hover:text-cognac-500`}
      >
        <svg viewBox="0 0 48 48" className="h-11 w-11">
          <path d="M24 2.5 45.5 24 24 45.5 2.5 24Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M24 8.5 39.5 24 24 39.5 8.5 24Z" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
          <text
            x="24"
            y="31.5"
            textAnchor="middle"
            fill="currentColor"
            style={{ font: "600 21px 'Cormorant Garamond', Georgia, serif" }}
          >
            H
          </text>
        </svg>
      </span>
      <span className="leading-none">
        <span
          className={`font-display block text-[25px] font-semibold tracking-[0.2em] ${
            light ? "text-sand-100" : "text-cocoa-900"
          }`}
        >
          HANI&rsquo;S
        </span>
        <span
          className={`mt-1 block text-[8.5px] font-medium uppercase tracking-[0.44em] ${
            light ? "text-sand-300" : "text-cocoa-500"
          }`}
        >
          Maison de couture
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

export default function Header() {
  const { cartCount, setCartOpen } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  return (
    <>
      {/* bandeau annonce */}
      <div className="relative z-[60] flex items-center justify-center gap-2 bg-cocoa-900 px-4 py-2 text-center text-[11px] uppercase tracking-[0.22em] text-sand-200">
        <IconSparkle size={11} className="shrink-0 text-cognac-300" />
        <span className="hidden sm:inline">Confection sur mesure · Livraison 72 h partout au Sénégal</span>
        <span className="sm:hidden">Sur mesure · Livraison 72 h</span>
        <IconSparkle size={11} className="shrink-0 text-cognac-300" />
      </div>

      <header
        className={`sticky top-0 z-[55] border-b transition-all duration-500 ${
          scrolled
            ? "border-sand-300/80 bg-sand-100/95 shadow-[0_10px_40px_-18px_rgba(60,42,27,0.35)] backdrop-blur-md"
            : "border-transparent bg-sand-100/60 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 lg:px-8">
          <Logo />

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `relative py-1 text-[12px] font-medium uppercase tracking-[0.18em] transition-colors duration-300 after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-cognac-500 after:transition-transform after:duration-300 hover:text-cognac-600 hover:after:scale-x-100 ${
                    isActive ? "text-cognac-600 after:scale-x-100" : "text-cocoa-700"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
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
                <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-cognac-500 px-1 text-[10px] font-semibold text-sand-50">
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
              href="https://wa.me/221778123456"
              target="_blank"
              rel="noreferrer"
              className="mt-5 flex items-center gap-3 text-sm text-sand-200 transition-colors hover:text-cognac-300"
            >
              <IconWhatsApp size={17} /> +221 77 812 34 56
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

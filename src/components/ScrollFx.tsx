import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

/** Effets liés au défilement : barre de progression, parallaxe et
 * progression d'une section. Tout est désactivé si l'utilisateur a demandé
 * moins d'animations (prefers-reduced-motion). */

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Appelle cb à chaque image pendant le défilement (une seule fois par
 * frame), et au redimensionnement. */
export function useScrollFrame(cb: () => void) {
  const cbRef = useRef(cb);
  useEffect(() => {
    cbRef.current = cb;
  });
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        cbRef.current();
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
}

/** Progression (0 → 1) d'un élément haut à travers la fenêtre : 0 quand son
 * haut touche le haut de l'écran, 1 quand son bas touche le bas. */
export function sectionProgress(el: HTMLElement): number {
  const r = el.getBoundingClientRect();
  const total = r.height - window.innerHeight;
  if (total <= 0) return r.top <= 0 ? 1 : 0;
  return Math.min(1, Math.max(0, -r.top / total));
}

/** Fine barre dorée en haut de l'écran qui suit la lecture de la page. */
export function ScrollProgressBar() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollFrame(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    if (ref.current) ref.current.style.transform = `scaleX(${p})`;
  });
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-[3px]">
      <div
        ref={ref}
        className="h-full origin-left bg-gradient-to-r from-cognac-600 via-cognac-400 to-cognac-300"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

/** Décale doucement son contenu au défilement (effet de profondeur).
 * strength : déplacement maximal en pixels, de part et d'autre. */
export function Parallax({
  children,
  strength = 40,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useScrollFrame(() => {
    const el = outer.current;
    if (!el || !inner.current) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.bottom < 0 || r.top > vh) return;
    // -1 quand l'élément entre par le bas, +1 quand il sort par le haut
    const t = (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
    inner.current.style.transform = `translate3d(0, ${(-t * strength).toFixed(1)}px, 0)`;
  });
  return (
    <div ref={outer} className={className}>
      <div ref={inner} className="will-change-transform">
        {children}
      </div>
    </div>
  );
}

/** Progression d'une section, en état React mais arrondie au centième
 * pour ne pas re-rendre à chaque pixel. */
export function useSectionProgress(ref: RefObject<HTMLElement | null>): number {
  const [p, setP] = useState(() => (prefersReducedMotion() ? 1 : 0));
  useScrollFrame(() => {
    if (!ref.current) return;
    const next = Math.round(sectionProgress(ref.current) * 100) / 100;
    setP((prev) => (prev === next ? prev : next));
  });
  return p;
}

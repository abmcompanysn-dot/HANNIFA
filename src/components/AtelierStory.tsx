import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { prefersReducedMotion, useSectionProgress } from "./ScrollFx";
import PaymentLogos from "./PaymentLogos";
import { IconArrow, IconNeedle, IconSwatch, IconTruck } from "./Icons";

/** Section animée « Du fil à votre porte » : en défilant, un fil se coud à
 * travers les quatre étapes d'une commande, et un cercle montre la part
 * déjà réglée (50 % à la commande, 50 % à la livraison). */

const SEAM = "M48 46 C 210 8, 372 86, 328 158 S 52 214, 92 292 S 352 306, 356 392";
const STOPS = [0.06, 0.36, 0.64, 0.94]; // position des étapes le long du fil

const STEPS = [
  {
    n: "01",
    t: "Choisissez votre pièce",
    d: "Un modèle de la boutique, ou une création sur mesure avec vos mesures et votre tissu.",
    icon: <IconSwatch size={18} />,
  },
  {
    n: "02",
    t: "Réglez 50 % pour lancer l'atelier",
    d: "Acompte sécurisé en quelques secondes avec Wave, Orange Money, Free Money ou carte bancaire.",
    icon: <span className="text-[13px] font-semibold">50%</span>,
  },
  {
    n: "03",
    t: "L'atelier coud votre tenue",
    d: "Coupe, couture main, finitions et repassage : environ 5 jours, suivi depuis votre espace client.",
    icon: <IconNeedle size={18} />,
  },
  {
    n: "04",
    t: "Livraison, puis le solde",
    d: "Vous recevez votre tenue et réglez les 50 % restants : par lien de paiement ou en espèces au livreur.",
    icon: <IconTruck size={18} />,
  },
];

type Pt = { x: number; y: number };

export default function AtelierStory() {
  const wrap = useRef<HTMLElement>(null);
  const path = useRef<SVGPathElement>(null);
  const p = useSectionProgress(wrap);
  const [still] = useState(prefersReducedMotion);
  const [geo, setGeo] = useState<{ len: number; stops: Pt[] } | null>(null);

  useLayoutEffect(() => {
    const el = path.current;
    if (!el) return;
    const len = el.getTotalLength();
    setGeo({
      len,
      stops: STOPS.map((f) => {
        const pt = el.getPointAtLength(len * f);
        return { x: pt.x, y: pt.y };
      }),
    });
  }, []);

  const step = p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.78 ? 2 : 3;
  const paid = p >= 0.9 ? 1 : p >= STOPS[1] ? 0.5 : 0;

  // Aiguille posée au bout du fil, orientée selon la couture
  let needle = "translate(48 46)";
  if (geo && path.current) {
    const l = Math.max(1, geo.len * p);
    const a = path.current.getPointAtLength(l - 1);
    const b = path.current.getPointAtLength(l);
    const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    needle = `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)}) rotate(${angle.toFixed(1)})`;
  }

  const RING = 2 * Math.PI * 34;

  return (
    <section ref={wrap} className={`relative mt-24 lg:mt-32 ${still ? "" : "h-[340vh]"}`}>
      <div className={`${still ? "" : "sticky top-0 h-[100svh]"} flex items-center overflow-hidden bg-cocoa-950 text-sand-100`}>
        {/* trame de tissu */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #d3a465 0 1px, transparent 1px 9px), repeating-linear-gradient(-45deg, #d3a465 0 1px, transparent 1px 9px)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-cognac-500/20 blur-[120px]"
        />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-6 px-5 py-10 lg:grid-cols-2 lg:gap-16 lg:px-8">
          {/* ---- scène : le fil qui se coud ---- */}
          <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[380px] lg:max-w-[460px]">
            <svg viewBox="0 0 400 430" className="h-auto w-full" aria-hidden>
              {/* repère de couture (pointillés) */}
              <path d={SEAM} fill="none" stroke="#d3a465" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="2 9" strokeLinecap="round" />
              {/* fil cousu */}
              <path
                ref={path}
                d={SEAM}
                fill="none"
                stroke="url(#hn-thread)"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeDasharray={geo ? `${geo.len}` : undefined}
                strokeDashoffset={geo ? geo.len * (1 - p) : undefined}
              />
              {/* points de couture qui apparaissent derrière l'aiguille */}
              <path
                d={SEAM}
                fill="none"
                stroke="#f3ebdc"
                strokeOpacity="0.85"
                strokeWidth="1.2"
                strokeDasharray="7 7"
                mask="url(#hn-sewn)"
              />
              <defs>
                <linearGradient id="hn-thread" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#d3a465" />
                  <stop offset="1" stopColor="#a87437" />
                </linearGradient>
                <linearGradient id="hn-steel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffffff" />
                  <stop offset="0.55" stopColor="#d9d4cc" />
                  <stop offset="1" stopColor="#8f8a82" />
                </linearGradient>
                <mask id="hn-sewn">
                  <path
                    d={SEAM}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="10"
                    strokeDasharray={geo ? `${geo.len}` : undefined}
                    strokeDashoffset={geo ? geo.len * (1 - p) : undefined}
                  />
                </mask>
              </defs>

              {/* étapes */}
              {geo?.stops.map((s, i) => {
                const on = p >= STOPS[i] - 0.01;
                return (
                  <g key={i} transform={`translate(${s.x} ${s.y})`}>
                    <circle r={on ? 22 : 16} fill={on ? "#a87437" : "#2e1f13"} stroke="#d3a465" strokeOpacity={on ? 1 : 0.4} strokeWidth="1.5" style={{ transition: "r .5s, fill .5s" }} />
                    {on && <circle r="22" fill="none" stroke="#d3a465" strokeOpacity="0.5" className="hn-ping" />}
                    <text textAnchor="middle" y="5" fontSize="13" fontWeight="600" fill={on ? "#f9f4ea" : "#b0946f"} style={{ fontFamily: "Jost, sans-serif" }}>
                      {STEPS[i].n}
                    </text>
                  </g>
                );
              })}

              {/* aiguille */}
              {!still && p > 0.005 && p < 0.995 && (
                <g transform={needle}>
                  {/* le chas est au bout du fil, la pointe file devant */}
                  <g transform="rotate(-10)">
                    <path d="M-2 0 C -2 -3.4, 4 -3.6, 8 -2.8 L54 -0.4 L58 0 L54 0.4 L8 2.8 C 4 3.6, -2 3.4, -2 0 Z" fill="url(#hn-steel)" stroke="#221710" strokeWidth="0.8" />
                    <ellipse cx="3.6" cy="0" rx="3.2" ry="1" fill="#221710" />
                  </g>
                </g>
              )}
            </svg>

            {/* cercle : part réglée */}
            <div className="absolute bottom-0 left-0 grid h-24 w-24 place-items-center sm:h-28 sm:w-28">
              <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90">
                <circle cx="40" cy="40" r="34" fill="#221710" stroke="#4e3826" strokeWidth="6" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="#d3a465"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={RING}
                  strokeDashoffset={RING * (1 - paid)}
                  style={{ transition: "stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)" }}
                />
              </svg>
              <span className="relative text-center leading-tight">
                <span className="font-display block text-2xl font-semibold text-sand-50 sm:text-3xl">{Math.round(paid * 100)}%</span>
                <span className="text-[9px] tracking-[0.2em] text-sand-300 uppercase">réglé</span>
              </span>
            </div>
          </div>

          {/* ---- texte ---- */}
          <div>
            <p className="eyebrow !text-cognac-300">Comment ça marche</p>
            <h2 className="font-display mt-3 text-4xl leading-[0.96] font-semibold sm:text-5xl lg:text-6xl">
              Du fil à <em className="text-cognac-300">votre porte</em>.
            </h2>

            <ol className="mt-6 space-y-1 lg:mt-9">
              {STEPS.map((s, i) => {
                const active = still || i === step;
                const done = !still && i < step;
                return (
                  <li
                    key={s.n}
                    className={`flex gap-4 border-l-2 py-2.5 pl-4 transition-all duration-500 ${
                      active ? "border-cognac-300" : done ? "border-cognac-600/60" : "border-sand-100/10"
                    } ${active ? "" : "hidden sm:flex"}`}
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors duration-500 ${
                        active ? "border-cognac-300 bg-cognac-500 text-sand-50" : "border-sand-100/15 text-sand-300/60"
                      }`}
                    >
                      {s.icon}
                    </span>
                    <div className={`transition-opacity duration-500 ${active ? "opacity-100" : "opacity-45"}`}>
                      <p className="font-display text-xl font-semibold sm:text-2xl">{s.t}</p>
                      <p
                        className={`grid text-sm leading-relaxed text-sand-300 transition-all duration-500 ${
                          active ? "mt-1 grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        <span className="overflow-hidden">{s.d}</span>
                      </p>
                      {i === 1 && active && <PaymentLogos className="mt-3" />}
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* points de progression (mobile) */}
            {!still && (
              <div className="mt-4 flex gap-2 sm:hidden" aria-hidden>
                {STEPS.map((s, i) => (
                  <span key={s.n} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-cognac-300" : "bg-sand-100/15"}`} />
                ))}
              </div>
            )}

            <Link to="/boutique" className="btn-light mt-7 lg:mt-10">
              Choisir ma tenue <IconArrow size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

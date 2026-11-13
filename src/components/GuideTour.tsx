import { useEffect, useState, type ReactNode } from "react";
import { IconArrow, IconClose } from "./Icons";

export type GuideStep = { icon: ReactNode; title: string; text: string };

/** Visite guidée : quelques écrans simples qui expliquent comment faire,
 * pour les personnes qui commandent en ligne pour la première fois. Elle
 * s'ouvre toute seule à la première visite (mémorisé dans le navigateur
 * sous `storageKey`) et se rouvre avec `open`. */
export default function GuideTour({
  steps,
  storageKey,
  open,
  onClose,
  startLabel = "C'est parti",
}: {
  steps: GuideStep[];
  storageKey: string;
  open: boolean;
  onClose: () => void;
  startLabel?: string;
}) {
  const [auto, setAuto] = useState(false);
  const [i, setI] = useState(0);
  const shown = open || auto;

  useEffect(() => {
    try {
      if (!localStorage.getItem(storageKey)) setAuto(true);
    } catch {
      // navigation privée : pas de visite automatique, le bouton reste là
    }
  }, [storageKey]);

  useEffect(() => {
    if (!shown) return;
    setI(0);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [shown]);

  const close = () => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      // sans stockage, elle se rouvrira à la prochaine visite
    }
    setAuto(false);
    onClose();
  };

  useEffect(() => {
    if (!shown) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  if (!shown) return null;
  const s = steps[i];
  const last = i === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[96] grid place-items-end sm:place-items-center" role="dialog" aria-modal="true" aria-label="Visite guidée">
      <div className="absolute inset-0 bg-cocoa-950/65 backdrop-blur-[2px]" onClick={close} />
      <div className="guide-in relative m-3 w-[calc(100%-1.5rem)] max-w-md overflow-hidden rounded-[34px] bg-sand-50 shadow-[0_40px_90px_-30px_rgba(34,23,16,0.8)]">
        <button
          onClick={close}
          aria-label="Fermer la visite guidée"
          className="absolute top-4 right-4 z-[1] grid h-10 w-10 cursor-pointer place-items-center rounded-full text-cocoa-700 transition-colors hover:bg-sand-200"
        >
          <IconClose />
        </button>

        <div className="hero-glow px-7 pt-9 pb-2 text-center">
          <p className="eyebrow">
            Visite guidée · {i + 1} / {steps.length}
          </p>
          <div key={i} className="announce-in">
            <span className="mx-auto mt-6 grid h-20 w-20 place-items-center rounded-full bg-cocoa-800 text-cognac-300 shadow-[0_18px_40px_-18px_rgba(46,31,19,0.8)]">
              {s.icon}
            </span>
            <h2 className="font-display mt-6 text-[32px] leading-[1.05] font-semibold text-cocoa-900">{s.title}</h2>
            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-cocoa-700">{s.text}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-2" aria-hidden>
          {steps.map((_, n) => (
            <span
              key={n}
              className={`h-1.5 rounded-full transition-all duration-500 ${n === i ? "w-8 bg-cognac-500" : "w-1.5 bg-sand-300"}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 px-6 pt-6 pb-6">
          {i > 0 ? (
            <button
              onClick={() => setI(i - 1)}
              className="cursor-pointer rounded-full px-4 py-3 text-[12px] font-medium tracking-[0.2em] text-cocoa-500 uppercase transition-colors hover:text-cocoa-800"
            >
              Retour
            </button>
          ) : (
            <button
              onClick={close}
              className="cursor-pointer rounded-full px-4 py-3 text-[12px] font-medium tracking-[0.2em] text-cocoa-500 uppercase transition-colors hover:text-cocoa-800"
            >
              Passer
            </button>
          )}
          <button onClick={() => (last ? close() : setI(i + 1))} className="btn-primary !px-7">
            {last ? startLabel : "Suivant"} <IconArrow size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

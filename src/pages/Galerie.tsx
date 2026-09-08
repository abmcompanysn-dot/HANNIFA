import { useCallback, useEffect, useState } from "react";
import { listGallery, ABMCYApiError, type GalleryItem } from "../services/abmcy";
import { MaskLines, Reveal } from "../components/Reveal";
import { IconArrow, IconClose, IconSparkle } from "../components/Icons";

const RATIOS = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]"];

// Catégorie API <-> libellé FR affiché
const CAT_LABELS: Record<GalleryItem["category"], string> = {
  femme: "Femme",
  homme: "Homme",
  sur_mesure: "Sur mesure",
  artisanat: "Artisanat",
};
type GalleryEntry = {
  id: string;
  src: string;
  catLabel: string;
  title: string;
  note: string;
};

function toEntry(g: GalleryItem): GalleryEntry {
  const catLabel = CAT_LABELS[g.category] || "Réalisation";
  const hasTitle = g.title && g.title.trim().length > 0;
  return {
    id: g.id,
    src: g.image_url,
    catLabel,
    title: hasTitle ? g.title : catLabel,
    note: g.description && g.description.trim().length > 0 ? g.description : "",
  };
}

export default function Galerie() {
  const [cat, setCat] = useState("Tout");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [items, setItems] = useState<GalleryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listGallery()
      .then((list) => {
        if (cancelled) return;
        setItems(list.map(toEntry));
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof ABMCYApiError ? e.message : "Impossible de charger la galerie pour le moment.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = cat === "Tout" ? items : items.filter((g) => g.catLabel === cat);

  const cats = ["Tout", ...Array.from(new Set(items.map((g) => g.catLabel)))];

  const close = useCallback(() => setLightbox(null), []);
  const step = useCallback(
    (dir: number) => {
      setLightbox((cur) => (cur === null ? cur : (cur + dir + filtered.length) % filtered.length));
    },
    [filtered.length]
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, close, step]);

  return (
    <div className="mx-auto max-w-7xl px-5 pt-14 lg:px-8">
      <div className="flex flex-col gap-8 border-b border-sand-300/80 pb-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Galerie de réalisations</p>
          <MaskLines
            className="font-display mt-3 text-5xl leading-[0.95] font-semibold text-cocoa-900 sm:text-6xl lg:text-7xl"
            lines={[
              <>Le savoir-faire,</>,
              <>
                en <em className="text-cognac-600">images</em>.
              </>,
            ]}
          />
        </div>
        <Reveal delay={200} className="shrink-0">
          <p className="flex items-center gap-3 text-sm text-cocoa-500">
            <IconSparkle size={14} className="text-cognac-600" />
            {items.length} création{items.length > 1 ? "s" : ""} photographiée{items.length > 1 ? "s" : ""} — mise à jour chaque semaine
          </p>
        </Reveal>
      </div>

      {loading && (
        <div className="py-24 text-center">
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-sand-300 border-t-cognac-600" />
          <p className="mt-4 text-sm text-cocoa-500">Chargement de la galerie…</p>
        </div>
      )}

      {!loading && error && (
        <div className="py-24 text-center">
          <p className="font-display text-2xl text-cocoa-800 italic">Impossible de charger la galerie</p>
          <p className="mt-3 text-sm text-cognac-700">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* filtres */}
          <div className="flex flex-wrap items-center gap-2.5 py-8">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`chip ${cat === c ? "chip-on" : ""}`}>
                {c}
                <span className="text-[10px] opacity-60">
                  {c === "Tout" ? items.length : items.filter((g) => g.catLabel === c).length}
                </span>
              </button>
            ))}
          </div>

          {/* mosaïque */}
          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display text-2xl text-cocoa-800 italic">Aucune réalisation dans cette catégorie</p>
            </div>
          ) : (
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:break-inside-avoid">
              {filtered.map((g, i) => (
                <Reveal key={g.id} delay={(i % 3) * 100} className="mb-6">
                  <button
                    onClick={() => setLightbox(i)}
                    className="group relative block w-full cursor-zoom-in overflow-hidden rounded-[8px] border border-sand-300/70 text-left"
                  >
                    <img
                      src={g.src}
                      alt={g.title}
                      loading="lazy"
                      className={`w-full object-cover object-top transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05] ${RATIOS[i % 3]}`}
                    />
                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-cocoa-950/85 via-cocoa-950/10 to-transparent p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <p className="text-[10px] tracking-[0.26em] text-cognac-300 uppercase">{g.catLabel}</p>
                      <p className="font-display mt-1 text-xl font-semibold text-sand-100">{g.title}</p>
                      {g.note && <p className="text-[12px] text-sand-300">{g.note}</p>}
                    </div>
                    <span className="absolute top-4 right-4 grid h-9 w-9 translate-y-1 place-items-center rounded-full bg-sand-50/90 text-cocoa-800 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
                      <IconArrow size={15} className="-rotate-45" />
                    </span>
                  </button>
                </Reveal>
              ))}
            </div>
          )}
        </>
      )}

      {/* visionneuse grand format */}
      {lightbox !== null && filtered[lightbox] && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-cocoa-950/95 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={filtered[lightbox].title}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-[11px] tracking-[0.3em] text-sand-300 uppercase">
              {filtered[lightbox].catLabel} — {lightbox + 1} / {filtered.length}
            </p>
            <button
              onClick={close}
              aria-label="Fermer"
              className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-sand-100/25 text-sand-100 transition-all hover:rotate-90 hover:border-cognac-300 hover:text-cognac-300"
            >
              <IconClose />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-4 pb-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => step(-1)}
              aria-label="Photo précédente"
              className="absolute left-3 z-10 grid h-12 w-12 cursor-pointer place-items-center rounded-full border border-sand-100/25 text-sand-100 transition-all hover:border-cognac-300 hover:text-cognac-300 sm:left-8"
            >
              <IconArrow size={18} className="rotate-180" />
            </button>
            <figure className="max-h-full text-center">
              <img
                src={filtered[lightbox].src}
                alt={filtered[lightbox].title}
                className="mx-auto max-h-[72vh] max-w-[92vw] rounded-[6px] object-contain shadow-2xl"
              />
              <figcaption className="mt-5">
                <p className="font-display text-2xl font-semibold text-sand-100 italic">
                  {filtered[lightbox].title}
                </p>
                {filtered[lightbox].note && (
                  <p className="mt-1 text-sm text-sand-300">{filtered[lightbox].note}</p>
                )}
              </figcaption>
            </figure>
            <button
              onClick={() => step(1)}
              aria-label="Photo suivante"
              className="absolute right-3 z-10 grid h-12 w-12 cursor-pointer place-items-center rounded-full border border-sand-100/25 text-sand-100 transition-all hover:border-cognac-300 hover:text-cognac-300 sm:right-8"
            >
              <IconArrow size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

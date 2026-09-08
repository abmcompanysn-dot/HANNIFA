import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fmtPrice } from "../data/catalog";
import type { Product as UiProduct } from "../data/catalog";
import { listProducts, ABMCYApiError } from "../services/abmcy";
import { mapProducts } from "../lib/mapProduct";
import ProductCard from "../components/ProductCard";
import { MaskLines, Reveal } from "../components/Reveal";
import { IconArrow, IconNeedle } from "../components/Icons";

type Gender = "all" | "femme" | "homme";

export default function Boutique() {
  const { gender: rawGender } = useParams();
  const gender: Gender = rawGender === "femme" || rawGender === "homme" ? rawGender : "all";
  const [sub, setSub] = useState("Toutes");
  const [sort, setSort] = useState("featured");

  const [products, setProducts] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listProducts()
      .then((list) => {
        if (cancelled) return;
        setProducts(mapProducts(list));
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof ABMCYApiError ? e.message : "Impossible de charger la boutique pour le moment.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const base = useMemo(
    () => products.filter((p) => gender === "all" || p.gender === gender),
    [products, gender]
  );

  const subs = useMemo(() => {
    const relevant = gender === "all" ? products : products.filter((p) => p.gender === gender);
    const distinct = Array.from(new Set(relevant.map((p) => p.sub))).filter(Boolean);
    distinct.sort((a, b) => a.localeCompare(b, "fr"));
    return distinct;
  }, [products, gender]);

  const list = useMemo(() => {
    let l = sub === "Toutes" ? base : base.filter((p) => p.sub === sub);
    if (sort === "price-asc") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") l = [...l].sort((a, b) => b.price - a.price);
    if (sort === "new") l = [...l].sort((a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false));
    return l;
  }, [base, sub, sort]);

  const title =
    gender === "femme" ? ["Collection", "Femme"] : gender === "homme" ? ["Collection", "Homme"] : ["Toutes les", "créations"];

  return (
    <div className="mx-auto max-w-7xl px-5 pt-14 lg:px-8">
      {/* entête éditoriale */}
      <div className="flex flex-col gap-8 border-b border-sand-300/80 pb-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">La boutique HANI&rsquo;S</p>
          <MaskLines
            className="font-display mt-3 text-5xl leading-[0.95] font-semibold text-cocoa-900 sm:text-6xl lg:text-7xl"
            lines={[
              title[0],
              <span key="i" className="text-cognac-600 italic">
                {title[1]}
              </span>,
            ]}
          />
        </div>
        <Reveal delay={200} className="shrink-0">
          <p className="max-w-xs text-sm leading-relaxed text-cocoa-500">
            <span className="font-display text-3xl font-semibold text-cocoa-800">{list.length}</span>{" "}
            {list.length > 1 ? "modèles disponibles" : "modèle disponible"} — chaque pièce peut être
            déclinée dans vos mesures.
          </p>
        </Reveal>
      </div>

      {/* filtres genre */}
      <div className="sticky top-[104px] z-30 -mx-5 border-b border-sand-300/70 bg-sand-100/95 px-5 py-4 backdrop-blur-md lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            {(
              [
                { g: "all" as Gender, to: "/boutique", label: "Tout" },
                { g: "femme" as Gender, to: "/boutique/femme", label: "Femme" },
                { g: "homme" as Gender, to: "/boutique/homme", label: "Homme" },
              ]
            ).map((t) => (
              <Link
                key={t.g}
                to={t.to}
                className={`chip ${gender === t.g ? "chip-on" : ""}`}
              >
                {t.label}
              </Link>
            ))}

            {subs.length > 0 && <span className="mx-1 hidden h-5 w-px bg-sand-300 sm:block" />}

            {subs.map((s) => (
              <button key={s} onClick={() => setSub(sub === s ? "Toutes" : s)} className={`chip ${sub === s ? "chip-on" : ""}`}>
                {s}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-3 lg:shrink-0">
            <span className="text-[11px] uppercase tracking-[0.2em] text-cocoa-500">Trier</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="field !w-auto !py-2 text-[13px]"
            >
              <option value="featured">Sélection de la maison</option>
              <option value="new">Nouveautés d'abord</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </label>
        </div>
      </div>

      {/* état de chargement / erreur */}
      {loading && (
        <div className="py-24 text-center">
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-sand-300 border-t-cognac-600" />
          <p className="mt-4 text-sm text-cocoa-500">Chargement de la boutique…</p>
        </div>
      )}

      {!loading && error && (
        <div className="py-24 text-center">
          <p className="font-display text-2xl text-cocoa-800 italic">Impossible de charger la boutique</p>
          <p className="mt-3 text-sm text-cognac-700">{error}</p>
        </div>
      )}

      {/* grille produits */}
      {!loading && !error && (
        list.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 pt-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((p, i) => (
              <ProductCard key={p.id} product={p} delay={(i % 4) * 90} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="font-display text-3xl text-cocoa-800 italic">Aucun modèle dans cette sélection</p>
            <button onClick={() => setSub("Toutes")} className="btn-ghost mt-6">
              Voir toute la collection
            </button>
          </div>
        )
      )}

      {/* bandeau sur mesure */}
      <Reveal className="mt-20">
        <div className="flex flex-col items-start justify-between gap-6 bg-cocoa-800 px-8 py-10 text-sand-100 sm:flex-row sm:items-center lg:px-12">
          <div className="flex items-center gap-5">
            <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-full border border-sand-100/25 text-cognac-300 sm:grid">
              <IconNeedle size={24} />
            </span>
            <div>
              <p className="eyebrow !text-cognac-300">Atelier sur mesure</p>
              <p className="font-display mt-1 text-2xl font-medium sm:text-3xl">
                Un modèle vous plaît ? Il existe aussi dans <em className="text-cognac-300">vos</em> mesures.
              </p>
            </div>
          </div>
          <Link to="/sur-mesure" className="btn-light shrink-0">
            Créer ma pièce <IconArrow size={15} />
          </Link>
        </div>
      </Reveal>

      {/* rappel prix */}
      <p className="mt-10 text-center text-[12px] tracking-wide text-cocoa-500">
        Prix affichés en francs CFA, livraison offerte à partir de {fmtPrice(50000)} d'achat · Retouches
        incluses sur chaque commande
      </p>
    </div>
  );
}

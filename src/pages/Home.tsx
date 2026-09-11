import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TESTIMONIALS, fmtPrice } from "../data/catalog";
import type { Product as UiProduct } from "../data/catalog";
import { listProducts, listGallery, type GalleryItem } from "../services/abmcy";
import { mapProducts } from "../lib/mapProduct";
import { MaskLines, Reveal } from "../components/Reveal";
import ProductCard from "../components/ProductCard";
import {
  IconArrow,
  IconCard,
  IconChevron,
  IconDiamond,
  IconNeedle,
  IconRuler,
  IconSparkle,
  IconSwatch,
  IconTruck,
} from "../components/Icons";

const MARQUEE = [
  "Sur mesure",
  "Couture main",
  "Tissus premium",
  "Confection 5 jours",
  "Paiement Wave · OM · Free Money",
  "Retouches incluses",
];

export default function Home() {
  const rowRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<UiProduct[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    listProducts()
      .then((list) => {
        if (!cancelled) setProducts(mapProducts(list));
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    listGallery()
      .then((list) => {
        if (!cancelled) setGallery(list);
      })
      .catch(() => {
        if (!cancelled) setGallery([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const news = products.filter((p) => p.isNew);
  const best = products.filter((p) => p.isBest).slice(0, 4);
  const teaser = gallery.slice(0, 3);
  const scrollRow = (dir: number) => rowRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <div>
      {/* ================= OUVERTURE ÉDITORIALE ================= */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pt-12 pb-20 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:pt-16">
          <div className="relative z-10 lg:col-span-5">
            <p className="eyebrow flex items-center gap-3">
              <IconSparkle size={12} /> Maison de couture — Dakar
            </p>
            <MaskLines
              className="font-display mt-6 text-[56px] leading-[0.92] font-semibold text-cocoa-900 sm:text-[76px] lg:text-[68px] xl:text-[80px]"
              lines={[
                <>L&rsquo;élégance,</>,
                <>
                  cousue <em className="text-cognac-600">main</em>.
                </>,
              ]}
            />
            <Reveal delay={350}>
              <p className="mt-7 max-w-md text-[15.5px] leading-relaxed text-cocoa-700">
                HANI&rsquo;S habille les femmes et les hommes qui aiment les belles choses :
                collections raffinées, créations sur mesure à vos mesures exactes, et tissus
                choisis par vous — de la première coupe au dernier point.
              </p>
            </Reveal>
            <Reveal delay={480} className="mt-9 flex flex-wrap items-center gap-4">
              <Link to="/boutique" className="btn-primary">
                Commander maintenant <IconArrow size={15} />
              </Link>
              <Link to="/sur-mesure" className="btn-ghost">
                <IconNeedle size={15} /> Créer sur mesure
              </Link>
            </Reveal>
            <Reveal delay={600} className="mt-12 grid max-w-md grid-cols-3 gap-5 border-t border-sand-300/80 pt-6">
              {[
                { icon: <IconTruck size={19} />, t: "Confection 5 jours", s: "Dakar & partout au Sénégal" },
                { icon: <IconSwatch size={19} />, t: "Tissus au choix", s: "Gamme ou envoi" },
                { icon: <IconCard size={19} />, t: "Paiement mobile", s: "Wave · OM · Free" },
              ].map((f) => (
                <div key={f.t}>
                  <span className="text-cognac-600">{f.icon}</span>
                  <p className="mt-2 text-[12.5px] leading-tight font-semibold text-cocoa-800">{f.t}</p>
                  <p className="text-[11.5px] text-cocoa-500">{f.s}</p>
                </div>
              ))}
            </Reveal>
          </div>

          <div className="relative lg:col-span-7">
            <Reveal delay={150}>
              <div className="arch pointer-events-none absolute -inset-3 translate-x-4 translate-y-4 border border-cognac-500/40" />
              <div className="arch relative overflow-hidden border border-sand-300/80">
                <img
                  src="https://abmcy.mahu.cards/c5a72dc0-54c9-4f3a-aa76-67a013e265f9/a7f9ed55-df37-4ca1-b9af-df2e6f6a61d3-Gemini_Generated_Image_n4vhw6n4vhw6n4vh.jpg"
                  alt="Collection Héritage HANI'S — mannequin de couturière et ruban à mesurer"
                  className="h-[440px] w-full animate-kenburns object-cover object-top sm:h-[560px] lg:h-[640px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cocoa-950/35 via-transparent to-transparent" />
              </div>
            </Reveal>

            {/* badge nouvelle collection */}
            <Reveal delay={500} className="absolute top-8 -left-3 sm:-left-8">
              <div className="animate-float border border-sand-300/70 bg-sand-50/95 px-5 py-4 shadow-[0_18px_50px_-20px_rgba(60,42,27,0.5)] backdrop-blur">
                <p className="eyebrow !text-[10px]">Nouvelle collection</p>
                <p className="font-display mt-1 text-2xl font-semibold text-cocoa-900 italic">Héritage</p>
                <p className="text-[11px] text-cocoa-500">Automne — Hiver 2025</p>
              </div>
            </Reveal>

            {/* badge circulaire rotatif */}
            <div className="absolute -bottom-12 -left-8 hidden h-36 w-36 md:block">
              <svg viewBox="0 0 100 100" className="h-full w-full animate-spin-slow text-cocoa-700">
                <defs>
                  <path id="hns-circ" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
                </defs>
                <text fontSize="8" letterSpacing="2.6" fill="currentColor" style={{ fontFamily: "Jost, sans-serif" }}>
                  <textPath href="#hns-circ">SUR MESURE · COUTURE MAIN · HANI&rsquo;S · DAKAR ·</textPath>
                </text>
              </svg>
              <span className="absolute inset-0 grid place-items-center text-cognac-500">
                <IconDiamond size={14} />
              </span>
            </div>

            <p className="absolute top-1/2 -right-4 hidden -translate-y-1/2 rotate-90 text-[10px] tracking-[0.5em] whitespace-nowrap text-cocoa-500 uppercase xl:block">
              Dakar
            </p>
          </div>
        </div>
      </section>

      {/* ================= RUBAN DÉFILANT ================= */}
      <div className="overflow-hidden border-y border-cocoa-700 bg-cocoa-800 py-4 text-sand-200">
        <div className="flex w-max animate-marquee items-center">
          {[...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={i} className="flex items-center">
              <span className="px-6 text-[12px] font-medium tracking-[0.32em] whitespace-nowrap uppercase">
                {t}
              </span>
              <IconDiamond size={7} className="text-cognac-300" />
            </span>
          ))}
        </div>
      </div>

      {/* ================= LA MAISON ================= */}
      <section className="mx-auto max-w-7xl px-5 pt-24 lg:px-8 lg:pt-32">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <div className="arch-sm relative overflow-hidden border border-sand-300/80">
                  <img
                    src="images/atelier.jpg"
                    alt="L'atelier HANI'S — couture à la main"
                    className="h-[460px] w-full object-cover transition-transform duration-[1.6s] ease-out hover:scale-[1.05] lg:h-[540px]"
                  />
                </div>
                <div className="relative z-10 -mt-10 ml-8 inline-block bg-cocoa-800 px-6 py-5 text-sand-100 shadow-[0_24px_60px_-24px_rgba(46,31,19,0.7)]">
                  <p className="font-display text-4xl font-semibold text-cognac-300">8 ans</p>
                  <p className="mt-1 text-[11px] tracking-[0.24em] uppercase">de savoir-faire transmis</p>
                </div>
              </Reveal>
            </div>
          </div>

          <div className="lg:col-span-7 lg:pt-10">
            <p className="eyebrow">La maison HANI&rsquo;S</p>
            <MaskLines
              className="font-display mt-4 text-5xl leading-[0.96] font-semibold text-cocoa-900 sm:text-6xl"
              lines={[
                <>Le geste juste,</>,
                <>
                  pièce après <em className="text-cognac-600">pièce</em>.
                </>,
              ]}
            />
            <Reveal delay={200}>
              <p className="mt-7 max-w-xl text-[15.5px] leading-relaxed text-cocoa-700">
                La maison HANI&rsquo;S marie les techniques de la haute couture aux tissus
                d'exception — jazz, lin, coton, soie, mousseline et motifs bogolan. Émus et
                inspirés par cet artisanat, nous mettons notre passion du bel habit et des
                accessoires au service de votre style, entre élégance, modestie et authenticité.
              </p>
              <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-cocoa-700">
                Chaque commande naît d'une véritable écoute : vos mesures, votre tissu, vos
                envies. De la robe de cérémonie au grand boubou brodé, nous concevons des
                vêtements décents, élégants et très bien taillés pour sublimer les femmes et
                les hommes. Rien ne sort de l'atelier sans avoir été vérifié, repassé et
                soigneusement ajusté à la main.
              </p>
            </Reveal>

            <div className="mt-12 grid max-w-xl grid-cols-3 divide-x divide-sand-300/80 border-y border-sand-300/80">
              {[
                { n: "Des milliers", l: "de créations déjà livrées" },
                { n: "Plusieurs", l: "artisans et ateliers partenaires" },
                { n: "100 %", l: "confection sur mesure et fait main" },
              ].map((s, i) => (
                <Reveal key={s.l} delay={i * 120} className={`py-6 ${i > 0 ? "pl-5" : ""}`}>
                  <p className="font-display text-3xl font-semibold text-cocoa-900">{s.n}</p>
                  <p className="mt-1 text-[12px] tracking-wide text-cocoa-500">{s.l}</p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={300}>
              <p className="font-display mt-10 text-2xl text-cocoa-800 italic">
                « Notre maison est née du regroupement d'artisans mus par une même passion :
                l'amour du beau geste, des vêtements décents et des accessoires élégants,
                conçus pour vous sublimer au quotidien comme lors de vos grands événements. »
              </p>
              <p className="mt-2 text-[12px] tracking-[0.24em] text-cocoa-500 uppercase">
                — La maison HANI&rsquo;S
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= NOS COLLECTIONS ================= */}
      <section className="mx-auto max-w-7xl px-5 pt-24 lg:px-8 lg:pt-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Nos collections</p>
            <MaskLines
              className="font-display mt-3 text-5xl leading-[0.96] font-semibold text-cocoa-900 sm:text-6xl"
              lines={[
                <>Deux vestiaires,</>,
                <>
                  une même <em className="text-cognac-600">exigence</em>.
                </>,
              ]}
            />
          </div>
          <Link
            to="/boutique"
            className="group inline-flex items-center gap-3 text-[12px] font-medium tracking-[0.22em] text-cocoa-700 uppercase transition-colors hover:text-cognac-600"
          >
            Toute la boutique
            <IconArrow size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <Link to="/boutique/femme" className="arch-sm group relative block h-[440px] overflow-hidden sm:h-[540px]">
              <img
                src="images/robe-ceremonie.jpg"
                alt="Collection Femme HANI'S"
                className="h-full w-full object-cover object-top transition-transform duration-[1.4s] ease-out group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cocoa-950/85 via-cocoa-950/20 to-transparent" />
              <div className="absolute right-6 bottom-6 left-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-medium tracking-[0.32em] text-cognac-300 uppercase">Collection</p>
                  <p className="font-display mt-1 text-5xl font-semibold text-sand-100">Femme</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Robes longues", "Cérémonie", "Ensembles", "Prière & khimars"].map((c) => (
                      <span key={c} className="border border-sand-100/30 px-3 py-1 text-[10.5px] tracking-[0.14em] text-sand-200 uppercase">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-sand-100/40 text-sand-100 transition-all duration-500 group-hover:rotate-45 group-hover:bg-cognac-500 group-hover:border-cognac-500">
                  <IconArrow size={20} className="-rotate-45 transition-transform duration-500 group-hover:rotate-0" />
                </span>
              </div>
            </Link>
          </Reveal>

          <Reveal delay={150} className="lg:col-span-5">
            <Link to="/boutique/homme" className="arch-sm group relative block h-[440px] overflow-hidden sm:h-[540px]">
              <img
                src="images/ensemble-homme.jpg"
                alt="Collection Homme HANI'S"
                className="h-full w-full object-cover object-top transition-transform duration-[1.4s] ease-out group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cocoa-950/85 via-cocoa-950/20 to-transparent" />
              <div className="absolute right-6 bottom-6 left-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-medium tracking-[0.32em] text-cognac-300 uppercase">Collection</p>
                  <p className="font-display mt-1 text-5xl font-semibold text-sand-100">Homme</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Ensembles", "Chemises", "Grands boubous"].map((c) => (
                      <span key={c} className="border border-sand-100/30 px-3 py-1 text-[10.5px] tracking-[0.14em] text-sand-200 uppercase">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-sand-100/40 text-sand-100 transition-all duration-500 group-hover:rotate-45 group-hover:bg-cognac-500 group-hover:border-cognac-500">
                  <IconArrow size={20} className="-rotate-45 transition-transform duration-500 group-hover:rotate-0" />
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ================= NOUVEAUTÉS ================= */}
      {news.length > 0 && (
        <section className="pt-24 lg:pt-32">
          <div className="mx-auto flex max-w-7xl items-end justify-between gap-6 px-5 lg:px-8">
            <div>
              <p className="eyebrow">Vient de sortir de l'atelier</p>
              <MaskLines
                className="font-display mt-3 text-5xl leading-[0.96] font-semibold text-cocoa-900 sm:text-6xl"
                lines={[<>Nouveautés</>]}
              />
            </div>
            <div className="hidden gap-2.5 sm:flex">
              <button
                onClick={() => scrollRow(-1)}
                aria-label="Faire défiler vers la gauche"
                className="grid h-12 w-12 cursor-pointer place-items-center rounded-full border border-cocoa-800/25 text-cocoa-800 transition-all hover:bg-cocoa-800 hover:text-sand-100"
              >
                <IconChevron size={18} className="rotate-90" />
              </button>
              <button
                onClick={() => scrollRow(1)}
                aria-label="Faire défiler vers la droite"
                className="grid h-12 w-12 cursor-pointer place-items-center rounded-full border border-cocoa-800/25 text-cocoa-800 transition-all hover:bg-cocoa-800 hover:text-sand-100"
              >
                <IconChevron size={18} className="-rotate-90" />
              </button>
            </div>
          </div>
          <div
            ref={rowRef}
            className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 lg:px-8"
          >
            {news.map((p, i) => (
              <div key={p.id} className="w-[272px] shrink-0 snap-start sm:w-[300px]">
                <ProductCard product={p} delay={i * 70} />
              </div>
            ))}
            <div className="flex w-[240px] shrink-0 snap-start items-center justify-center">
              <Link
                to="/boutique"
                className="group flex flex-col items-center gap-4 text-cocoa-700 transition-colors hover:text-cognac-600"
              >
                <span className="grid h-16 w-16 place-items-center rounded-full border border-cocoa-800/25 transition-all duration-300 group-hover:border-cognac-500 group-hover:bg-cognac-500 group-hover:text-sand-100">
                  <IconArrow size={22} />
                </span>
                <span className="text-[11px] tracking-[0.26em] uppercase">Tout voir</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ================= MEILLEURES VENTES ================= */}
      {best.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-24 lg:px-8 lg:pt-28">
          <p className="eyebrow">Les pièces que l'on s'arrache</p>
          <MaskLines
            className="font-display mt-3 text-5xl leading-[0.96] font-semibold text-cocoa-900 sm:text-6xl"
            lines={[
              <>
                Meilleures <em className="text-cognac-600">ventes</em>
              </>,
            ]}
          />
          <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {best.map((p, i) => (
              <div key={p.id} className="relative">
                <span
                  aria-hidden
                  className="font-display pointer-events-none absolute -top-12 -left-2 z-0 text-[110px] leading-none font-semibold text-sand-300/70 select-none"
                >
                  {i + 1}
                </span>
                <div className="relative z-[1]">
                  <ProductCard product={p} delay={i * 90} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= SUR MESURE ================= */}
      <section className="relative mt-24 overflow-hidden bg-cocoa-900 text-sand-100 lg:mt-32">
        <span
          aria-hidden
          className="font-display pointer-events-none absolute -bottom-10 right-2 hidden text-[190px] leading-none font-semibold whitespace-nowrap text-sand-100/[0.05] italic select-none lg:block"
        >
          sur mesure
        </span>
        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-28">
          <div>
            <p className="eyebrow !text-cognac-300">L'atelier vous écoute</p>
            <MaskLines
              className="font-display mt-4 text-5xl leading-[0.96] font-semibold sm:text-6xl"
              lines={[
                <>Votre tenue,</>,
                <>
                  vos <em className="text-cognac-300">mesures</em>.
                </>,
              ]}
            />
            <Reveal delay={200}>
              <p className="mt-7 max-w-md text-[15.5px] leading-relaxed text-sand-300">
                Un modèle repéré dans la boutique, une idée en tête, un tissu qui vous attend
                dans votre armoire ? Décrivez-nous votre pièce idéale : l'atelier s'occupe du
                reste, des mesures à la dernière retouche.
              </p>
            </Reveal>
            <Reveal delay={320} className="mt-9 flex flex-wrap gap-4">
              <Link to="/sur-mesure" className="btn-light">
                Commencer ma commande <IconArrow size={15} />
              </Link>
              <a
                href="https://wa.me/22675544742"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-4 py-4 text-[12px] font-medium tracking-[0.22em] text-sand-200 uppercase transition-colors hover:text-cognac-300"
              >
                ou sur WhatsApp
              </a>
            </Reveal>
            <Reveal delay={420}>
              <p className="mt-10 border-l-2 border-cognac-500 pl-5 text-sm leading-relaxed text-sand-300 italic">
                « Je souhaite ce modèle avec ce tissu et des manches légèrement plus larges. »
                <span className="mt-2 block text-[11px] tracking-[0.22em] text-cognac-300 uppercase not-italic">
                  — exemple de demande client, réalisable en 5 jours
                </span>
              </p>
            </Reveal>
          </div>

          <div className="self-center">
            {[
              {
                n: "01",
                icon: <IconRuler size={22} />,
                t: "Transmettez vos mesures",
                d: "Six à sept mesures simples, guidées par notre schéma interactif — femme ou homme.",
              },
              {
                n: "02",
                icon: <IconSwatch size={22} />,
                t: "Choisissez votre tissu",
                d: "Dans notre gamme de huit étoffes, en envoyant une photo du vôtre, ou laissez-nous vous conseiller.",
              },
              {
                n: "03",
                icon: <IconNeedle size={22} />,
                t: "Suivez la confection",
                d: "Confirmation immédiate, suivi d'avancement étape par étape, essayage et retouches inclus.",
              },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 140}>
                <div className="group flex items-start gap-6 border-b border-sand-100/12 py-7 transition-all duration-500 first:border-t hover:pl-3">
                  <span className="font-display text-3xl font-medium text-cognac-300 italic">{s.n}</span>
                  <span className="grid h-13 w-13 shrink-0 place-items-center rounded-full border border-sand-100/20 text-sand-200 transition-all duration-500 group-hover:border-cognac-300 group-hover:text-cognac-300">
                    {s.icon}
                  </span>
                  <div>
                    <p className="font-display text-2xl font-semibold">{s.t}</p>
                    <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-sand-300">{s.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= GALERIE TEASER ================= */}
      {teaser.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-24 lg:px-8 lg:pt-32">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Galerie de réalisations</p>
              <MaskLines
                className="font-display mt-3 text-5xl leading-[0.96] font-semibold text-cocoa-900 sm:text-6xl"
                lines={[<>Sorties de l'atelier</>]}
              />
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-cocoa-500">
              Chaque semaine, de nouvelles créations rejoignent la galerie — portées par nos
              clientes et clients, avec leur accord.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {teaser.map((g, i) => (
              <Reveal key={g.id} delay={i * 130} className={i === 1 ? "sm:translate-y-10" : ""}>
                <Link to="/galerie" className="group relative block overflow-hidden rounded-[8px]">
                  <img
                    src={g.image_url}
                    alt={g.title || "Réalisation HANI'S"}
                    className={`w-full object-cover transition-transform duration-[1.3s] ease-out group-hover:scale-[1.06] ${
                      i === 1 ? "h-[340px]" : "h-[400px]"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cocoa-950/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  {g.title && (
                    <p className="font-display absolute bottom-5 left-5 translate-y-3 text-xl text-sand-100 italic opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      {g.title}
                    </p>
                  )}
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="mt-16 text-center sm:mt-20">
            <Link to="/galerie" className="btn-ghost">
              Explorer la galerie <IconArrow size={15} />
            </Link>
          </div>
        </section>
      )}

      {/* ================= TÉMOIGNAGES ================= */}
      <section className="mx-auto max-w-7xl px-5 pt-24 lg:px-8 lg:pt-32">
        <p className="eyebrow text-center">Elles & ils portent du HANI&rsquo;S</p>
        <MaskLines
          className="font-display mt-3 text-center text-5xl leading-[0.96] font-semibold text-cocoa-900 sm:text-6xl"
          lines={[<>La parole aux <em className="text-cognac-600">clients</em></>]}
        />
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 140} className={i === 1 ? "md:translate-y-10" : ""}>
              <figure className="relative">
                <span aria-hidden className="font-display block text-7xl leading-[0.6] text-cognac-500/35">
                  &ldquo;
                </span>
                <blockquote className="mt-4 text-[15.5px] leading-relaxed text-cocoa-700">{t.quote}</blockquote>
                <figcaption className="mt-5 border-t border-sand-300/80 pt-4">
                  <p className="font-display text-xl font-semibold text-cocoa-900">{t.name}</p>
                  <p className="text-[11.5px] tracking-[0.2em] text-cocoa-500 uppercase">{t.city}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= APPEL FINAL ================= */}
      <section className="mx-auto max-w-7xl px-5 pt-24 lg:px-8 lg:pt-28">
        <Reveal>
          <div className="relative overflow-hidden bg-cocoa-800 px-8 py-14 text-sand-100 sm:px-14">
            <span aria-hidden className="absolute top-6 left-8 text-cognac-300"><IconSparkle size={16} /></span>
            <span aria-hidden className="absolute right-10 bottom-6 text-cognac-300/60"><IconSparkle size={22} /></span>
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div>
                <p className="eyebrow !text-cognac-300">Collection Héritage disponible</p>
                <p className="font-display mt-3 max-w-xl text-4xl leading-tight font-semibold sm:text-5xl">
                  Prête à porter une pièce qui n'appartient qu'à <em className="text-cognac-300">vous</em> ?
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-4">
                <Link to="/boutique" className="btn-light">
                  Commander maintenant
                </Link>
                <Link to="/sur-mesure" className="inline-flex items-center gap-3 border border-sand-100/30 px-8 py-4 text-[12px] font-medium tracking-[0.22em] uppercase transition-all hover:border-cognac-300 hover:text-cognac-300">
                  Sur mesure dès {fmtPrice(40000)}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

import { Reveal } from "./Reveal";

/** Trois petites arches qui flottent dans l'entête d'une page (boutique,
 * galerie) : elles montrent tout de suite de vraies pièces au lieu d'un
 * grand vide à côté du titre. Purement décoratif. */
export default function PageArches({
  images,
}: {
  images: { src: string; pos?: string }[];
}) {
  const shown = images.filter((im) => im.src).slice(0, 3);
  if (shown.length === 0) return null;
  return (
    <div aria-hidden className="flex items-end gap-3.5 lg:gap-4">
      {shown.map((im, i) => (
        <Reveal key={`${im.src}-${i}`} delay={150 + i * 130} className={i === 1 ? "-translate-y-5" : ""}>
          <div className="frame animate-float" style={{ padding: 6, animationDelay: `${i * -2.3}s` }}>
            <div className="frame-in curtain">
              <img
                src={im.src}
                alt=""
                loading="lazy"
                className="h-[140px] w-[98px] object-cover object-top lg:h-[172px] lg:w-[120px]"
                style={{ objectPosition: im.pos }}
              />
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

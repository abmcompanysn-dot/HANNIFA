import { useState } from "react";
import { Link } from "react-router-dom";
import { fmtPrice, type Product } from "../data/catalog";
import { useStore } from "../context/StoreContext";
import { Reveal } from "./Reveal";
import { IconBag } from "./Icons";

export default function ProductCard({
  product,
  delay = 0,
}: {
  product: Product;
  delay?: number;
}) {
  const [ci, setCi] = useState(0);
  const { addToCart } = useStore();
  const color = product.colors[ci];

  const quickAdd = () =>
    addToCart({
      key: `${product.id}-${color.name}-${product.sizes[0]}`,
      kind: "product",
      productId: product.id,
      name: product.name,
      detail: `${color.name} · Taille ${product.sizes[0]}`,
      price: product.price,
      image: product.image,
      colorName: color.name,
      size: product.sizes[0],
    });

  return (
    <Reveal delay={delay} className="group relative flex h-full flex-col">
      <div className="relative overflow-hidden rounded-[8px] border border-sand-300/70 bg-sand-200">
        <Link to={`/produit/${product.id}`} className="block aspect-[3/4] overflow-hidden">
          <img
            src={product.image}
            alt={`${product.name} — coloris ${color.name}`}
            loading="lazy"
            className="h-full w-full object-cover object-top transition-[transform,filter] duration-700 ease-out group-hover:scale-[1.06]"
            style={{ filter: color.filter || undefined, objectPosition: product.objectPos }}
          />
        </Link>

        {/* badges */}
        <div className="pointer-events-none absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-cognac-500 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-sand-50">
              Nouveauté
            </span>
          )}
          {product.isBest && (
            <span className="bg-cocoa-800/90 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-sand-100">
              Best-seller
            </span>
          )}
        </div>

        {/* commande rapide */}
        <button
          onClick={quickAdd}
          className="absolute right-3 bottom-3 left-3 flex cursor-pointer items-center justify-center gap-2.5 bg-cocoa-900/95 py-3.5 text-[11px] font-medium uppercase tracking-[0.24em] text-sand-100 backdrop-blur-sm transition-all duration-400 ease-out hover:bg-cognac-600 active:scale-[0.98] md:translate-y-[120%] md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
        >
          <IconBag size={15} /> Commander
        </button>
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-cocoa-500">
          {product.gender === "femme" ? "Femme" : "Homme"} · {product.sub}
        </p>
        <Link
          to={`/produit/${product.id}`}
          className="font-display mt-1 text-xl leading-snug font-semibold text-cocoa-900 transition-colors hover:text-cognac-600"
        >
          {product.name}
        </Link>
        <p className="mt-1 text-[15px] font-semibold text-cognac-600">{fmtPrice(product.price)}</p>

        {/* coloris */}
        <div className="mt-3 flex items-center gap-2 border-t border-sand-300/60 pt-3">
          {product.colors.map((c, i) => (
            <button
              key={c.name}
              onClick={() => setCi(i)}
              title={c.name}
              aria-label={`Coloris ${c.name}`}
              className={`h-5 w-5 cursor-pointer rounded-full border transition-all duration-300 hover:scale-110 ${
                i === ci
                  ? "scale-110 border-cocoa-800 ring-2 ring-cocoa-800/25 ring-offset-1 ring-offset-sand-100"
                  : "border-cocoa-500/30"
              }`}
              style={{ background: c.hex }}
            />
          ))}
          <span className="ml-auto text-[11px] tracking-wide text-cocoa-500 italic">{color.name}</span>
        </div>
      </div>
    </Reveal>
  );
}

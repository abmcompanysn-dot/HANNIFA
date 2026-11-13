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
    <Reveal early delay={delay} className="group relative flex h-full flex-col">
      <div className="frame">
      <div className="frame-in">
        <Link to={`/produit/${product.id}`} className="block aspect-[3/4] overflow-hidden">
          <img
            src={product.image}
            alt={`${product.name} — coloris ${color.name}`}
            loading="lazy"
            className="h-full w-full object-cover object-top transition-[transform,filter] duration-[1.1s] ease-out group-hover:scale-[1.07]"
            style={{ filter: color.filter || undefined, objectPosition: product.objectPos }}
          />
        </Link>

        {/* commande rapide */}
        <button
          onClick={quickAdd}
          aria-label={`Commander ${product.name}`}
          className="absolute right-2.5 bottom-2.5 flex h-11 w-11 cursor-pointer items-center justify-center gap-2.5 rounded-full bg-cocoa-900/95 text-[11px] font-medium uppercase tracking-[0.24em] text-sand-100 backdrop-blur-sm transition-all duration-400 ease-out hover:bg-cognac-600 active:scale-[0.96] md:right-3 md:left-3 md:h-auto md:w-auto md:translate-y-[120%] md:py-3.5 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
        >
          {/* téléphone : un rond discret, pour ne pas cacher le bas de la tenue */}
          <IconBag size={15} /> <span className="hidden md:inline">Commander</span>
        </button>
      </div>
      </div>

      <div className="flex flex-1 flex-col px-1 pt-5">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] font-medium uppercase tracking-[0.24em] text-cocoa-500">
          <span>
            {product.gender === "femme" ? "Femme" : "Homme"}
            {product.sub && product.sub !== "Non classé" && <> · {product.sub}</>}
          </span>
          {/* étiquettes hors de la photo : l'arche couperait un coin */}
          {product.isNew && (
            <span className="rounded-full bg-cognac-500 px-2 py-0.5 text-[9px] font-semibold tracking-[0.16em] text-sand-50">Nouveauté</span>
          )}
          {product.isBest && (
            <span className="rounded-full bg-cocoa-800 px-2 py-0.5 text-[9px] font-semibold tracking-[0.16em] text-sand-100">Best-seller</span>
          )}
        </p>
        <Link
          to={`/produit/${product.id}`}
          className="font-display mt-1.5 text-[22px] leading-[1.15] font-semibold text-cocoa-900 transition-colors hover:text-cognac-600"
        >
          {product.name}
        </Link>
        <p className="mt-1.5 text-[15px] font-semibold tracking-wide text-cognac-600 tabular-nums">{fmtPrice(product.price)}</p>

        {/* coloris : seulement s'il y a un choix à faire */}
        {product.colors.length > 1 && (
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
        )}
      </div>
    </Reveal>
  );
}

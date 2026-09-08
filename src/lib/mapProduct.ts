/**
 * Adaptateur Product API ABMCY -> Product tel qu'attendu par l'UI existante
 * (ProductCard, ProductDetail, Boutique, Home — mêmes noms de champs que
 * l'ancien src/data/catalog.ts) afin de minimiser les changements dans les
 * composants d'affichage.
 *
 * Repli défensif : un produit créé plus tard depuis le dashboard tenant n'est
 * pas forcément enrichi comme les 29 produits d'origine. On ne fait jamais
 * planter l'affichage — on dégrade proprement (une seule couleur repliée sur
 * `colorway`, `sub`/`gender` vides traités comme "non classé").
 */
import type { Product as ApiProduct } from "../services/abmcy";
import type { ColorOption, Product as UiProduct } from "../data/catalog";

const FALLBACK_HEX = "#a78f76"; // taupe neutre

function fallbackColors(attrs: Record<string, any>): ColorOption[] {
  const colorway = attrs.colorway || attrs.color;
  if (typeof colorway === "string" && colorway.trim()) {
    return [{ name: colorway.trim(), hex: FALLBACK_HEX, filter: "" }];
  }
  return [{ name: "Coloris unique", hex: FALLBACK_HEX, filter: "" }];
}

/** Transforme un produit brut de l'API ABMCY en objet compatible avec l'UI existante. */
export function mapProduct(p: ApiProduct): UiProduct {
  const attrs = p.attributes || {};

  const colors: ColorOption[] = Array.isArray(attrs.colors) && attrs.colors.length > 0
    ? attrs.colors.map((c: any) => ({
        name: c?.name || "Coloris",
        hex: c?.hex || FALLBACK_HEX,
        filter: c?.filter || "",
      }))
    : fallbackColors(attrs);

  const sizes: string[] = Array.isArray(attrs.sizes) && attrs.sizes.length > 0
    ? attrs.sizes
    : ["Unique"];

  const gender: "femme" | "homme" = attrs.gender === "homme" ? "homme" : "femme";

  const image = attrs.image_url || p.image_url || "images/hero.jpg";

  return {
    id: p.id,
    name: p.name,
    gender,
    sub: attrs.sub || "Non classé",
    price: p.price,
    image,
    objectPos: attrs.objectPos,
    description: p.description || attrs.model || p.name,
    composition: attrs.composition || "",
    colors,
    sizes,
    isNew: !!attrs.isNew,
    isBest: !!attrs.isBest,
  };
}

export function mapProducts(list: ApiProduct[]): UiProduct[] {
  return list.map(mapProduct);
}

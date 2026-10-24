/**
 * Les quatre nuances du catalogue HANI'S (Terre & Chaleur, Bleu & Ardoise,
 * Jardin, Audace) — la fiche modèle reprend le dégradé de la nuance de la
 * pièce, pour que le site raconte la même histoire de couleurs que le
 * catalogue PDF. Déduite du nom du modèle : un nom sans mot-clé de couleur
 * retombe sur Terre & Chaleur, la nuance signature de la maison.
 */
export type Nuance = {
  key: "terre" | "ardoise" | "jardin" | "audace";
  label: string;
  grad: string;
  accent: string;
};

const NUANCES: Record<Nuance["key"], Nuance> = {
  terre: {
    key: "terre",
    label: "Terre & Chaleur",
    grad: "linear-gradient(120deg, #7a4c2b 0%, #c08a57 50%, #ecd2a8 100%)",
    accent: "#8a5a34",
  },
  ardoise: {
    key: "ardoise",
    label: "Bleu & Ardoise",
    grad: "linear-gradient(120deg, #172a45 0%, #3d5f8a 50%, #a9c1d6 100%)",
    accent: "#1f3350",
  },
  jardin: {
    key: "jardin",
    label: "Jardin",
    grad: "linear-gradient(120deg, #3f5130 0%, #7c9465 50%, #dfe2cb 100%)",
    accent: "#4a5c3a",
  },
  audace: {
    key: "audace",
    label: "Audace",
    grad: "linear-gradient(120deg, #4f1020 0%, #8f2d46 50%, #e0a0ae 100%)",
    accent: "#5c1626",
  },
};

export function nuanceFor(name: string): Nuance {
  const n = name.toLowerCase();
  if (/bordeaux|prune|rouge|rose|violet|cauris noir/.test(n)) return NUANCES.audace;
  if (/bleu|marine|ciel|ardoise|gris/.test(n)) return NUANCES.ardoise;
  if (/vert|kaki|sauge|blanc|ivoire/.test(n)) return NUANCES.jardin;
  return NUANCES.terre;
}

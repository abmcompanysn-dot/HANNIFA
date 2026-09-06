export type ColorOption = { name: string; hex: string; filter: string };

export type Product = {
  id: string;
  name: string;
  gender: "femme" | "homme";
  sub: string;
  price: number;
  image: string;
  objectPos?: string;
  description: string;
  composition: string;
  colors: ColorOption[];
  sizes: string[];
  isNew?: boolean;
  isBest?: boolean;
};

export const FEMME_SUBS = [
  "Robes longues",
  "Robes de cérémonie",
  "Robes du quotidien",
  "Ensembles élégants",
  "Ensembles décontractés",
  "Ensembles de prière",
  "Khimars",
  "Autres vêtements de prière",
] as const;

export const HOMME_SUBS = ["Ensembles", "Chemises"] as const;

export const PRODUCTS: Product[] = [
  {
    id: "robe-awa",
    name: "Robe Awa",
    gender: "femme",
    sub: "Robes longues",
    price: 45000,
    image: "images/robe-longue.jpg",
    description:
      "Une robe longue fluide aux manches dramatiques, brodée à la main au fil doré. Coupe ample et gracieuse, pensée pour accompagner chacun de vos mouvements avec élégance.",
    composition: "Crêpe de Médine premium · Broderie main au fil de soie",
    colors: [
      { name: "Terracotta", hex: "#9c5a3c", filter: "" },
      { name: "Ivoire", hex: "#e9dfc8", filter: "sepia(0.45) saturate(0.4) brightness(1.18) hue-rotate(-8deg)" },
      { name: "Ébène", hex: "#2f241b", filter: "brightness(0.52) sepia(0.3) saturate(0.6)" },
      { name: "Olive", hex: "#6e6449", filter: "hue-rotate(28deg) saturate(0.62) sepia(0.2)" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    isNew: true,
    isBest: true,
  },
  {
    id: "robe-ndeye",
    name: "Robe Ndeye",
    gender: "femme",
    sub: "Robes de cérémonie",
    price: 68000,
    image: "images/robe-ceremonie.jpg",
    description:
      "Kaftan de cérémonie en brocart royal, entièrement rebrodé de perles et de fils dorés. La pièce d'exception pour les grands jours : baptêmes, mariages, Korité et Tabaski.",
    composition: "Brocart royal · Perles cousues main · Doublure satin",
    colors: [
      { name: "Or champagne", hex: "#c2a05a", filter: "" },
      { name: "Ébène", hex: "#2f241b", filter: "brightness(0.5) sepia(0.35) saturate(0.55)" },
      { name: "Bordeaux", hex: "#6e2f36", filter: "hue-rotate(-38deg) saturate(0.85) sepia(0.25) brightness(0.82)" },
    ],
    sizes: ["S", "M", "L", "XL"],
    isNew: true,
  },
  {
    id: "robe-sokhna",
    name: "Robe Sokhna",
    gender: "femme",
    sub: "Robes du quotidien",
    price: 32000,
    image: "images/robe-quotidien.jpg",
    description:
      "La robe de tous les jours, en coton léger à la coupe simple et seyante, ceinturée à la taille. Confortable du matin au soir, sans jamais renoncer au style.",
    composition: "Coton peigné 220 g · Ceinture amovible",
    colors: [
      { name: "Ivoire", hex: "#e9dfc8", filter: "" },
      { name: "Terracotta", hex: "#9c5a3c", filter: "sepia(0.55) saturate(1.1) hue-rotate(-12deg) brightness(0.92)" },
      { name: "Brume", hex: "#cbb9a2", filter: "sepia(0.35) saturate(0.5) brightness(1.04)" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    isBest: true,
  },
  {
    id: "ensemble-yacine",
    name: "Ensemble Yacine",
    gender: "femme",
    sub: "Ensembles élégants",
    price: 55000,
    image: "images/ensemble-femme.jpg",
    description:
      "Tunique longue et pantalon ample assorti, taillés dans un crêpe au tombé impeccable. Un deux-pièces sophistiqué qui vous suit du bureau aux grandes occasions.",
    composition: "Crêpe satin stretch · Finitions cousues main",
    colors: [
      { name: "Olive", hex: "#6e6449", filter: "" },
      { name: "Terracotta", hex: "#9c5a3c", filter: "hue-rotate(-30deg) saturate(1.05) sepia(0.25) brightness(0.98)" },
      { name: "Ébène", hex: "#2f241b", filter: "brightness(0.55) saturate(0.6) sepia(0.15)" },
    ],
    sizes: ["S", "M", "L", "XL"],
    isNew: true,
    isBest: true,
  },
  {
    id: "ensemble-binta",
    name: "Ensemble Binta",
    gender: "femme",
    sub: "Ensembles décontractés",
    price: 38000,
    image: "images/ensemble-femme.jpg",
    objectPos: "center 18%",
    description:
      "Version décontractée de notre deux-pièces signature : tissu lavé au toucher doux, coupe relax, poches invisibles. L'élégance sans effort, au quotidien.",
    composition: "Lin lavé mélangé · Poches côtés",
    colors: [
      { name: "Sable", hex: "#d8c4a0", filter: "sepia(0.5) saturate(0.42) brightness(1.15) hue-rotate(-10deg)" },
      { name: "Chocolat", hex: "#5a3a24", filter: "sepia(0.6) brightness(0.78) saturate(0.9)" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: "priere-salam",
    name: "Ensemble de prière Salam",
    gender: "femme",
    sub: "Ensembles de prière",
    price: 28000,
    image: "images/priere.jpg",
    description:
      "Ensemble de prière deux pièces au voile enveloppant, en tissu opaque et respirant. Coutures plates, tombé fluide : conçu pour la sérénité.",
    composition: "Mousseline double couche · Opaque, non transparent",
    colors: [
      { name: "Taupe", hex: "#a78f76", filter: "" },
      { name: "Ivoire", hex: "#e9dfc8", filter: "sepia(0.4) saturate(0.35) brightness(1.2) hue-rotate(-6deg)" },
      { name: "Ébène", hex: "#2f241b", filter: "brightness(0.55) sepia(0.25) saturate(0.55)" },
    ],
    sizes: ["Unique", "M", "L"],
    isBest: true,
  },
  {
    id: "khimar-nour",
    name: "Khimar Nour",
    gender: "femme",
    sub: "Khimars",
    price: 15000,
    image: "images/priere.jpg",
    objectPos: "center 12%",
    description:
      "Khimar deux voiles à la coupe étudiée : couvrant sans alourdir, il encadre le visage avec douceur. Ourlets roulottés à la main.",
    composition: "Crêpe de Médine léger · Ourlets roulottés main",
    colors: [
      { name: "Taupe", hex: "#a78f76", filter: "" },
      { name: "Brume", hex: "#cbb9a2", filter: "sepia(0.35) saturate(0.4) brightness(1.15)" },
      { name: "Ébène", hex: "#2f241b", filter: "brightness(0.55) sepia(0.25) saturate(0.55)" },
    ],
    sizes: ["Unique"],
  },
  {
    id: "priere-meryem",
    name: "Robe de prière Meryem",
    gender: "femme",
    sub: "Autres vêtements de prière",
    price: 22000,
    image: "images/priere.jpg",
    objectPos: "center 80%",
    description:
      "Robe de prière une pièce, voile attaché, qui se porte en un geste. Livrée avec sa pochette de rangement assortie, pour l'emporter partout.",
    composition: "Microfibre respirante · Voile intégré · Pochette offerte",
    colors: [
      { name: "Sable", hex: "#d8c4a0", filter: "sepia(0.45) saturate(0.5) brightness(1.12)" },
      { name: "Brume", hex: "#cbb9a2", filter: "sepia(0.3) saturate(0.42) brightness(1.16)" },
      { name: "Ébène", hex: "#2f241b", filter: "brightness(0.55) sepia(0.25) saturate(0.55)" },
    ],
    sizes: ["Unique", "L"],
  },
  {
    id: "ensemble-malick",
    name: "Ensemble Malick",
    gender: "homme",
    sub: "Ensembles",
    price: 52000,
    image: "images/ensemble-homme.jpg",
    description:
      "Grand boubou deux pièces en bazin riche, brodé ton sur ton au col et aux poignets. Une allure présidentielle pour vos cérémonies et vendredis solennels.",
    composition: "Bazin riche Getzner · Broderie artisanale",
    colors: [
      { name: "Cacao", hex: "#5a3a24", filter: "" },
      { name: "Ébène", hex: "#2f241b", filter: "brightness(0.55) sepia(0.25) saturate(0.6)" },
      { name: "Sable", hex: "#d8c4a0", filter: "sepia(0.5) saturate(0.45) brightness(1.18) hue-rotate(-8deg)" },
    ],
    sizes: ["M", "L", "XL", "XXL"],
    isNew: true,
  },
  {
    id: "ensemble-karim",
    name: "Ensemble Karim",
    gender: "homme",
    sub: "Ensembles",
    price: 46000,
    image: "images/ensemble-homme.jpg",
    objectPos: "center 15%",
    description:
      "Ensemble tunique et pantalon à la coupe contemporaine, col officier et boutons recouverts. Le compromis parfait entre tradition et modernité.",
    composition: "Coton sergé premium · Boutons recouverts main",
    colors: [
      { name: "Bronze", hex: "#7a5433", filter: "sepia(0.45) brightness(0.85) saturate(0.95)" },
      { name: "Ivoire", hex: "#e9dfc8", filter: "sepia(0.5) saturate(0.35) brightness(1.22) hue-rotate(-8deg)" },
      { name: "Ébène", hex: "#2f241b", filter: "brightness(0.5) sepia(0.3) saturate(0.6)" },
    ],
    sizes: ["M", "L", "XL", "XXL"],
  },
  {
    id: "chemise-ibrahima",
    name: "Chemise Ibrahima",
    gender: "homme",
    sub: "Chemises",
    price: 25000,
    image: "images/chemise-homme.jpg",
    description:
      "Chemise en lin lavé à la broderie discrète sur la patte de boutonnage. Col structuré, coupe ajustée : l'essentiel du vestiaire masculin, élevé.",
    composition: "Lin lavé 185 g · Broderie ton sur ton",
    colors: [
      { name: "Écru", hex: "#e9dfc8", filter: "" },
      { name: "Sable", hex: "#d8c4a0", filter: "sepia(0.45) saturate(0.55) brightness(1.02) hue-rotate(-6deg)" },
      { name: "Bronze", hex: "#7a5433", filter: "sepia(0.6) saturate(0.9) brightness(0.88) hue-rotate(-10deg)" },
    ],
    sizes: ["M", "L", "XL", "XXL"],
    isBest: true,
  },
  {
    id: "chemise-ousmane",
    name: "Chemise Ousmane",
    gender: "homme",
    sub: "Chemises",
    price: 27000,
    image: "images/chemise-homme.jpg",
    objectPos: "center 20%",
    description:
      "Chemise ample à col mao, manches longues et finitions soignées. Un classique revisité par l'atelier, disponible en plusieurs teintes minérales.",
    composition: "Popeline de coton · Col mao · Poignets boutonnés",
    colors: [
      { name: "Bronze", hex: "#7a5433", filter: "sepia(0.55) saturate(0.85) brightness(0.9) hue-rotate(-8deg)" },
      { name: "Ivoire", hex: "#e9dfc8", filter: "sepia(0.4) saturate(0.4) brightness(1.2)" },
      { name: "Ébène", hex: "#2f241b", filter: "brightness(0.55) sepia(0.3) saturate(0.6)" },
    ],
    sizes: ["M", "L", "XL", "XXL"],
    isNew: true,
  },
];

export const FABRICS = [
  { id: "crepe-ivoire", name: "Crêpe satin", tone: "Ivoire", extra: 0, swatch: "linear-gradient(135deg,#efe6d2 0%,#e3d5b8 45%,#f4ecd9 100%)", desc: "Fluide et infroissable, le choix de la maison." },
  { id: "soie-bronze", name: "Soie sauvage", tone: "Bronze", extra: 6000, swatch: "linear-gradient(135deg,#a87437 0%,#8f5f28 40%,#c08a45 75%,#a87437 100%)", desc: "Reflets profonds, main légèrement texturée." },
  { id: "lin-sable", name: "Lin lavé", tone: "Sable", extra: 3500, swatch: "repeating-linear-gradient(90deg,#d8c4a0 0 3px,#cfba94 3px 6px)", desc: "Respirant, tombé souple, parfait au quotidien." },
  { id: "brocart-or", name: "Brocart royal", tone: "Or", extra: 9000, swatch: "radial-gradient(circle at 30% 30%,#e4c57e,transparent 45%),linear-gradient(135deg,#c2a05a,#a5824a 60%,#c2a05a)", desc: "Tissé de motifs floraux, pour les cérémonies." },
  { id: "medine-ebene", name: "Crêpe de Médine", tone: "Ébène", extra: 2500, swatch: "linear-gradient(135deg,#3a2d22 0%,#241a12 55%,#3a2d22 100%)", desc: "Opaque et mat, idéal pour la prière." },
  { id: "bazin-nuit", name: "Bazin riche", tone: "Bleu nuit", extra: 8000, swatch: "linear-gradient(135deg,#31405c 0%,#232f46 50%,#3d4d6d 100%)", desc: "Le bazin Getzner authentique, éclat glacé." },
  { id: "wax-terre", name: "Wax premium", tone: "Terre", extra: 4500, swatch: "radial-gradient(circle at 25% 35%,#e9dfc8 0 6%,transparent 7%),radial-gradient(circle at 70% 70%,#e9dfc8 0 5%,transparent 6%),linear-gradient(135deg,#9c5a3c,#7d452c)", desc: "Imprimés exclusifs dessinés pour HANI'S." },
  { id: "mousseline-brume", name: "Mousseline", tone: "Brume", extra: 2000, swatch: "linear-gradient(135deg,#cbb9a2 0%,#baa68c 50%,#d6c6b0 100%)", desc: "Légère et vaporeuse, double épaisseur." },
];

export const GALLERY = [
  { src: "images/hero.jpg", cat: "Sur mesure", title: "Abaya Aïcha — commande sur mesure", note: "Crêpe de Médine, broderie main" },
  { src: "images/robe-longue.jpg", cat: "Femme", title: "Robe Awa en terracotta", note: "Collection Héritage" },
  { src: "images/robe-ceremonie.jpg", cat: "Femme", title: "Kaftan Ndeye, perles et or", note: "Pièce de cérémonie" },
  { src: "images/ensemble-homme.jpg", cat: "Homme", title: "Boubou Malick en bazin riche", note: "Broderie artisanale" },
  { src: "images/priere.jpg", cat: "Femme", title: "Ensemble de prière Salam", note: "Mousseline double couche" },
  { src: "images/atelier.jpg", cat: "Artisanat", title: "L'atelier, geste après geste", note: "Cousu main à Dakar" },
  { src: "images/tissus.jpg", cat: "Artisanat", title: "Sélection de tissus de la maison", note: "Soie, lin, brocart, bazin" },
  { src: "images/ensemble-femme.jpg", cat: "Femme", title: "Ensemble Yacine olive", note: "Deux-pièces signature" },
  { src: "images/chemise-homme.jpg", cat: "Homme", title: "Chemise Ibrahima en lin lavé", note: "Broderie ton sur ton" },
  { src: "images/robe-quotidien.jpg", cat: "Femme", title: "Robe Sokhna, l'essentielle", note: "Coton peigné" },
  { src: "images/ensemble-homme.jpg", cat: "Sur mesure", title: "Ensemble Karim ajusté client", note: "Retouches sur mesure" },
  { src: "images/robe-longue.jpg", cat: "Sur mesure", title: "Déclinaison ébène sur commande", note: "Teinte à la demande" },
];

export const GALLERY_CATS = ["Tout", "Femme", "Homme", "Sur mesure", "Artisanat"];

export const TESTIMONIALS = [
  {
    quote:
      "Ma robe de Korité était encore plus belle qu'en photo. Les mesures envoyées sur le site ont été respectées au centimètre près.",
    name: "Awa D.",
    city: "Dakar — Sacré-Cœur",
  },
  {
    quote:
      "J'ai envoyé une photo de mon bazin, trois jours plus tard l'ensemble était en confection. Le suivi de commande est très clair.",
    name: "Moussa S.",
    city: "Saint-Louis",
  },
  {
    quote:
      "Le khimar Nour est d'une douceur incroyable. Paiement Wave en deux minutes, livraison à Thiès en 48 h. Je recommande les yeux fermés.",
    name: "Fatou N.",
    city: "Thiès",
  },
];

export const MEASURES_FEMME = [
  { key: "poitrine", label: "Tour de poitrine", n: 1 },
  { key: "taille", label: "Tour de taille", n: 2 },
  { key: "hanches", label: "Tour de hanches", n: 3 },
  { key: "epaules", label: "Largeur d'épaules", n: 4 },
  { key: "manches", label: "Longueur des manches", n: 5 },
  { key: "longueur", label: "Longueur totale de la tenue", n: 6 },
];

export const MEASURES_HOMME = [
  { key: "poitrine", label: "Tour de poitrine", n: 1 },
  { key: "taille", label: "Tour de taille", n: 2 },
  { key: "hanches", label: "Tour de hanches", n: 3 },
  { key: "epaules", label: "Largeur d'épaules", n: 4 },
  { key: "manches", label: "Longueur des manches", n: 5 },
  { key: "pantalon", label: "Longueur du pantalon", n: 6 },
  { key: "longueur", label: "Longueur totale de la tenue", n: 7 },
];

export const PAYMENTS = [
  { id: "wave", name: "Wave", tag: "Paiement mobile", color: "#1b9cd8", hint: "Vous recevrez une notification Wave pour valider." },
  { id: "om", name: "Orange Money", tag: "Paiement mobile", color: "#e8710a", hint: "Un message de confirmation Orange Money vous sera envoyé." },
  { id: "free", name: "Free Money", tag: "Paiement mobile", color: "#d42b2b", hint: "Validez la demande sur votre compte Free Money." },
  { id: "card", name: "Carte bancaire", tag: "Visa · Mastercard", color: "#2e4b6e", hint: "Paiement sécurisé 3-D Secure." },
];

export const ORDER_STAGES = [
  { key: "recorded", label: "Commande enregistrée" },
  { key: "confirmed", label: "Confirmée par l'atelier" },
  { key: "making", label: "En confection" },
  { key: "shipped", label: "Expédiée" },
  { key: "delivered", label: "Livrée" },
];

/** stage index derived from elapsed time (demo acceleration) */
export function stageOf(placedAt: number): number {
  const mins = (Date.now() - placedAt) / 60000;
  if (mins < 2) return 0;
  if (mins < 6) return 1;
  if (mins < 12) return 2;
  if (mins < 20) return 3;
  return 4;
}

export const fmtPrice = (n: number) => `${n.toLocaleString("fr-FR")} F`;

export const SOCIALS = [
  { id: "instagram", label: "Instagram", href: "https://instagram.com/hanis.couture" },
  { id: "tiktok", label: "TikTok", href: "https://tiktok.com/@hanis.couture" },
  { id: "facebook", label: "Facebook", href: "https://facebook.com/hanis.couture" },
  { id: "whatsapp", label: "WhatsApp Business", href: "https://wa.me/221778123456" },
];

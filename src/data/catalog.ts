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

/**
 * Anciennes listes statiques FEMME_SUBS / HOMME_SUBS / PRODUCTS / FABRICS
 * supprimées — remplacées par de vrais appels API (GET /products,
 * GET /fabrics). Les sous-catégories sont dérivées dynamiquement des
 * produits chargés (voir Boutique.tsx), et les 8 tissus "maison" existent
 * maintenant comme de vrais tissus ABMCY avec photo (voir SurMesure.tsx).
 */

/**
 * Anciennes listes statiques GALLERY / GALLERY_CATS supprimées — remplacées
 * par un vrai appel API (GET /gallery), voir Galerie.tsx et Home.tsx.
 */

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

export const fmtPrice = (n: number) => `${n.toLocaleString("fr-FR")} F`;

export const SOCIALS = [
  { id: "instagram", label: "Instagram", href: "https://instagram.com/hanis.couture" },
  { id: "tiktok", label: "TikTok", href: "https://tiktok.com/@hanis.couture" },
  { id: "facebook", label: "Facebook", href: "https://facebook.com/hanis.couture" },
  { id: "whatsapp", label: "WhatsApp Business", href: "https://wa.me/221778123456" },
];

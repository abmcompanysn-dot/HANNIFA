/**
 * Script ponctuel : enrichit les 29 produits HANI'S déjà en production sur ABMCY Core
 * avec des attributes que l'API ne modélise pas nativement (gender, sub, colors[], isNew/isBest),
 * en s'inspirant du modèle éditorial de src/data/catalog.ts (FEMME_SUBS, ColorOption).
 *
 * Usage: node scripts/enrich-products.mjs
 * Nécessite: variable d'env ABMCY_API_KEY (ou la valeur par défaut ci-dessous en fallback).
 */

const API_BASE_URL = process.env.VITE_ABMCY_API_URL || "https://api.abmcy.com";
const API_KEY = process.env.ABMCY_API_KEY || process.env.VITE_ABMCY_API_KEY || "";

if (!API_KEY || API_KEY.includes("demo") || API_KEY.includes("votre_cle")) {
  console.error("ERREUR: fournis une vraie clé API via la variable d'env ABMCY_API_KEY.");
  process.exit(1);
}

// Sous-catégories cohérentes pour du prêt-à-porter féminin HANI'S (mêmes noms que FEMME_SUBS)
const SUB_KEYWORDS = [
  { sub: "Robes de cérémonie", kw: ["cérémonie", "ceremonie", "mariage", "gala", "soirée", "soiree"] },
  { sub: "Robes longues", kw: ["robe longue", "maxi robe", "robe fluide"] },
  { sub: "Robes du quotidien", kw: ["robe"] },
  { sub: "Ensembles élégants", kw: ["ensemble", "tailleur", "deux-pièces", "deux pieces", "co-ord"] },
  { sub: "Ensembles décontractés", kw: ["décontracté", "decontracte", "casual"] },
  { sub: "Kimonos", kw: ["kimono"] },
];

function guessSub(name, category) {
  const hay = `${name} ${category}`.toLowerCase();
  for (const { sub, kw } of SUB_KEYWORDS) {
    if (kw.some((k) => hay.includes(k))) return sub;
  }
  if (hay.includes("kimono")) return "Kimonos";
  if (hay.includes("robe")) return "Robes du quotidien";
  if (hay.includes("ensemble")) return "Ensembles élégants";
  return "Ensembles élégants";
}

// Table de correspondance couleur texte -> hex approximatif (inspirée de la palette catalog.ts)
const COLOR_HEX = {
  blanc: "#e9dfc8",
  ivoire: "#e9dfc8",
  ecru: "#e9dfc8",
  écru: "#e9dfc8",
  noir: "#1a1a1a",
  ebene: "#2f241b",
  ébène: "#2f241b",
  bordeaux: "#6d2530",
  rouge: "#a8332c",
  bleu: "#31405c",
  "bleu nuit": "#232f46",
  marine: "#232f46",
  vert: "#4a6340",
  olive: "#6b7a3a",
  kaki: "#6b7a3a",
  jaune: "#d8b94a",
  moutarde: "#c2a05a",
  or: "#c2a05a",
  dore: "#c2a05a",
  doré: "#c2a05a",
  rose: "#d69bab",
  fuchsia: "#b23a72",
  violet: "#5a3a6e",
  mauve: "#8a6a8f",
  gris: "#8a8378",
  argent: "#b7b2a8",
  beige: "#d8c4a0",
  sable: "#d8c4a0",
  taupe: "#a78f76",
  brun: "#5a3a24",
  marron: "#5a3a24",
  chocolat: "#5a3a24",
  cacao: "#5a3a24",
  bronze: "#7a5433",
  terracotta: "#9c5a3c",
  orange: "#c2611a",
  corail: "#c96b56",
  turquoise: "#2f8f8a",
  ciel: "#7fa8c9",
  fushia: "#b23a72",
  multicolore: "#a87437",
};

function hexFor(colorName) {
  const key = colorName
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  for (const [k, v] of Object.entries(COLOR_HEX)) {
    const kNorm = k.normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (key.includes(kNorm)) return v;
  }
  return "#a78f76"; // taupe neutre par défaut
}

// Découpe "Blanc & Noir", "Bordeaux, Noir", "Bleu nuit et Or" en entrées individuelles
function splitColorway(colorway) {
  if (!colorway || typeof colorway !== "string") return ["Taupe"];
  const parts = colorway
    .split(/&|\+|,| et | avec /gi)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.slice(0, 2) : [colorway.trim()];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiRequest(path, options = {}, retries = 4) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
          ...(options.headers || {}),
        },
      });
      const text = await res.text();
      let body;
      try {
        body = text ? JSON.parse(text) : {};
      } catch {
        body = { raw: text };
      }
      if (!res.ok) {
        const err = new Error(body?.error?.message || `HTTP ${res.status}`);
        err.status = res.status;
        err.body = body;
        throw err;
      }
      return body;
    } catch (e) {
      const transient = e.cause?.code === "ECONNRESET" || e.message === "fetch failed";
      if (transient && attempt < retries) {
        await sleep(500 * (attempt + 1));
        continue;
      }
      throw e;
    }
  }
}

async function main() {
  console.log(`Récupération des produits depuis ${API_BASE_URL}/products ...`);
  const products = await apiRequest("/products");
  const list = Array.isArray(products) ? products : products.products || products.items || [];
  console.log(`${list.length} produits trouvés.`);

  let success = 0;
  let failed = 0;
  const results = [];

  // Répartition simple des badges: 2 isNew, 2 isBest, réparties sur des index différents
  const newIdx = new Set();
  const bestIdx = new Set();
  if (list.length > 0) {
    const step = Math.max(1, Math.floor(list.length / 4));
    newIdx.add(0 % list.length);
    newIdx.add(step % list.length);
    bestIdx.add((step * 2) % list.length);
    bestIdx.add((step * 3) % list.length);
  }

  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    const existingAttrs = p.attributes || {};
    const colorway = existingAttrs.colorway || existingAttrs.color || "";
    const colorNames = splitColorway(colorway);
    const colors = colorNames.map((name) => ({ name, hex: hexFor(name) }));

    const sub = guessSub(p.name || existingAttrs.model || "", p.category || "");

    const attributes = {
      ...existingAttrs,
      gender: "femme",
      sub,
      colors,
    };
    if (newIdx.has(i)) attributes.isNew = true;
    if (bestIdx.has(i)) attributes.isBest = true;

    try {
      await apiRequest(`/products/${p.id}`, {
        method: "PATCH",
        body: JSON.stringify({ attributes }),
      });
      success++;
      results.push({ id: p.id, name: p.name, sub, colors: colorNames, status: "ok" });
      console.log(`OK   ${p.name} -> sub="${sub}" colors=${JSON.stringify(colorNames)}${attributes.isNew ? " [isNew]" : ""}${attributes.isBest ? " [isBest]" : ""}`);
    } catch (e) {
      failed++;
      results.push({ id: p.id, name: p.name, status: "error", error: e.message });
      console.error(`FAIL ${p.name} (${p.id}): ${e.message}`);
    }
  }

  console.log(`\nTerminé: ${success} produits enrichis avec succès, ${failed} échecs sur ${list.length} au total.`);

  if (success > 0) {
    console.log("\nVérification d'un échantillon...");
    const sampleIds = results.filter((r) => r.status === "ok").slice(0, 3).map((r) => r.id);
    for (const id of sampleIds) {
      try {
        const fresh = await apiRequest(`/products/${id}`);
        console.log(`  ${id}: attributes.gender=${fresh.attributes?.gender}, sub=${fresh.attributes?.sub}, colors=${JSON.stringify(fresh.attributes?.colors)}`);
      } catch (e) {
        console.error(`  ${id}: échec vérification (${e.message})`);
      }
    }
  }
}

main().catch((e) => {
  console.error("Erreur fatale:", e);
  process.exit(1);
});

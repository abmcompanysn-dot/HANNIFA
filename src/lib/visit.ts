import { API_BASE_URL, TENANT_SLUG } from "../services/abmcy";

// Compteur de visiteurs ABMCY Core (POST /public/{slug}/visit) : une page
// vue à chaque changement de page. Aucun cookie et aucune donnée
// personnelle : un identifiant aléatoire gardé dans le navigateur
// reconnaît le visiteur ; le pays vient de la connexion (Cloudflare).

function visitorId(): string {
  try {
    let id = localStorage.getItem("abmcy_vid");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("abmcy_vid", id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function firstOfSession(): boolean {
  try {
    if (sessionStorage.getItem("abmcy_sess")) return false;
    sessionStorage.setItem("abmcy_sess", "1");
  } catch {
    // stockage bloqué : chaque page compte comme une visite
  }
  return true;
}

/** Lien partagé avec ?src=whatsapp (avant ou après le #) : la visite est
 * classée dans cette source. */
function campaign(routeSearch: string): string {
  for (const q of [window.location.search, routeSearch]) {
    const p = new URLSearchParams(q);
    const v = p.get("src") || p.get("utm_source");
    if (v) return v;
  }
  return "";
}

export function trackVisit(path: string, routeSearch = "") {
  if (!TENANT_SLUG || typeof window === "undefined") return;
  try {
    const first = firstOfSession();
    let referrer = "";
    if (first && document.referrer) {
      try {
        if (new URL(document.referrer).host !== window.location.host) referrer = document.referrer;
      } catch {
        // referrer illisible : ignoré
      }
    }
    const body = JSON.stringify({ v: visitorId(), f: first, p: path, r: referrer, c: first ? campaign(routeSearch) : "" });
    const url = `${API_BASE_URL}/public/${encodeURIComponent(TENANT_SLUG)}/visit`;
    const sent = navigator.sendBeacon?.(url, new Blob([body], { type: "text/plain" }));
    if (!sent) {
      fetch(url, { method: "POST", body, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
    }
  } catch {
    // le compteur ne doit jamais gêner la visite
  }
}

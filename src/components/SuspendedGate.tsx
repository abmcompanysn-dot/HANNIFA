import { useEffect, useState, type ReactNode } from "react";
import { API_BASE_URL, TENANT_SLUG } from "../services/abmcy";
import { IconWhatsApp } from "./Icons";

// Suspension du site par ABMCY Core (fin de période d'essai, impayé).
// Au chargement, le site demande son état à l'API : s'il est suspendu,
// toute la page est remplacée par un message et un lien WhatsApp vers
// ABMCY Core. La réactivation depuis le dashboard admin ABMCY rétablit le
// site immédiatement, sans redéploiement. Si l'API ne répond pas, le site
// s'affiche normalement : une panne réseau ne doit jamais le bloquer.

type TenantStatus = {
  active: boolean;
  message?: string;
  support_whatsapp?: string;
};

const DEFAULT_MESSAGE =
  "Ce site est temporairement indisponible. La période d'essai est terminée : contactez ABMCY Core pour activer votre site.";

function SuspendedScreen({ status }: { status: TenantStatus }) {
  const digits = (status.support_whatsapp ?? "").replace(/\D/g, "");
  const whatsappUrl = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(
        "Bonjour ABMCY Core, je souhaite activer mon site HANI'S."
      )}`
    : "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-50 px-5 py-16">
      <div className="w-full max-w-lg text-center">
        <p className="eyebrow">Site temporairement indisponible</p>
        <h1 className="font-display mt-4 text-4xl font-semibold text-cocoa-900 sm:text-5xl">
          Période d'essai terminée
        </h1>
        <p className="mt-6 text-base leading-relaxed text-cocoa-500">
          {status.message || DEFAULT_MESSAGE}
        </p>
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#1f8f52] px-7 py-3.5 text-sm font-semibold text-sand-50 shadow-[0_16px_38px_-10px_rgba(31,143,82,0.75)] transition-transform hover:scale-105"
          >
            <IconWhatsApp size={20} />
            Contacter ABMCY Core sur WhatsApp
          </a>
        ) : (
          <a
            href="https://cors.abmcy.com"
            className="mt-10 inline-flex items-center rounded-full bg-cocoa-900 px-7 py-3.5 text-sm font-semibold text-sand-50"
          >
            Contacter ABMCY Core
          </a>
        )}
        <p className="mt-12 text-xs text-cocoa-500/70">Plateforme ABMCY Core</p>
      </div>
    </div>
  );
}

export default function SuspendedGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<TenantStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/public/${TENANT_SLUG}/status`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: TenantStatus | null) => {
        if (!cancelled && data) setStatus(data);
      })
      .catch(() => {
        // API injoignable : on laisse le site s'afficher.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status && status.active === false) {
    return <SuspendedScreen status={status} />;
  }
  return <>{children}</>;
}

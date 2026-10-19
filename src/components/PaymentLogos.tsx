/** Logos des moyens de paiement acceptés (dessinés en SVG, pas d'image
 * externe). Utilisés dans le pied de page et à la commande. */

const H = 30; // hauteur commune des pastilles

function Wave() {
  return (
    <svg viewBox="0 0 92 30" height={H} role="img" aria-label="Wave">
      <rect width="92" height="30" rx="7" fill="#1DC8F2" />
      {/* silhouette du pingouin Wave, simplifiée */}
      <g transform="translate(9 5)">
        <ellipse cx="7" cy="11" rx="6.2" ry="8.6" fill="#fff" />
        <ellipse cx="7.6" cy="12.4" rx="3.6" ry="6" fill="#1DC8F2" />
        <circle cx="6.6" cy="5.4" r="1.1" fill="#0b2b3a" />
        <path d="M9.6 6.2 L13.4 7.4 L9.8 8.4 Z" fill="#FFB400" />
      </g>
      <text x="30" y="20.5" fill="#fff" fontFamily="'Arial Rounded MT Bold', Arial, sans-serif" fontSize="15" fontWeight="800" letterSpacing="0.3">
        wave
      </text>
    </svg>
  );
}

function OrangeMoney() {
  return (
    <svg viewBox="0 0 120 30" height={H} role="img" aria-label="Orange Money">
      <rect width="120" height="30" rx="7" fill="#000" />
      <rect x="8" y="8" width="14" height="14" fill="#FF7900" />
      <rect x="8" y="21" width="14" height="1.6" fill="#fff" />
      <text x="28" y="19.6" fill="#fff" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700">
        Orange <tspan fill="#FF7900">Money</tspan>
      </text>
    </svg>
  );
}

function FreeMoney() {
  return (
    <svg viewBox="0 0 104 30" height={H} role="img" aria-label="Free Money">
      <rect width="104" height="30" rx="7" fill="#CD0A2C" />
      <text x="10" y="20" fill="#fff" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="900" fontStyle="italic">
        free
      </text>
      <text x="45" y="19.6" fill="#fff" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="400">
        money
      </text>
    </svg>
  );
}

function Visa() {
  return (
    <svg viewBox="0 0 62 30" height={H} role="img" aria-label="Visa">
      <rect width="62" height="30" rx="7" fill="#fff" />
      <text x="31" y="20.5" textAnchor="middle" fill="#1A1F71" fontFamily="Arial, sans-serif" fontSize="15" fontWeight="900" fontStyle="italic" letterSpacing="0.6">
        VISA
      </text>
    </svg>
  );
}

function Mastercard() {
  return (
    <svg viewBox="0 0 52 30" height={H} role="img" aria-label="Mastercard">
      <rect width="52" height="30" rx="7" fill="#fff" />
      <circle cx="21" cy="15" r="8.5" fill="#EB001B" />
      <circle cx="31" cy="15" r="8.5" fill="#F79E1B" />
      <path d="M26 8.2a8.5 8.5 0 0 1 0 13.6a8.5 8.5 0 0 1 0-13.6Z" fill="#FF5F00" />
    </svg>
  );
}

export const PAYMENT_LOGOS = [
  { id: "wave", el: <Wave /> },
  { id: "om", el: <OrangeMoney /> },
  { id: "free", el: <FreeMoney /> },
  { id: "visa", el: <Visa /> },
  { id: "mc", el: <Mastercard /> },
];

export default function PaymentLogos({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {PAYMENT_LOGOS.map((l) => (
        <span
          key={l.id}
          className="inline-flex shrink-0 rounded-[7px] shadow-[0_6px_16px_-10px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:-translate-y-0.5"
        >
          {l.el}
        </span>
      ))}
    </div>
  );
}

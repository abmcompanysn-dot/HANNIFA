import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (p: P) => {
  const { size = 20, ...rest } = p;
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
};

export const IconBag = (p: P) => (
  <svg {...base(p)}>
    <path d="M5.5 8.5h13l-1.1 11a1.6 1.6 0 0 1-1.6 1.5H8.2a1.6 1.6 0 0 1-1.6-1.5l-1.1-11Z" />
    <path d="M8.8 8.5V6.8a3.2 3.2 0 0 1 6.4 0v1.7" />
    <path d="M9.5 12.2c.4 1.2 1.3 1.9 2.5 1.9s2.1-.7 2.5-1.9" />
  </svg>
);

export const IconUser = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M4.8 20.2c.9-3.6 3.8-5.6 7.2-5.6s6.3 2 7.2 5.6" />
  </svg>
);

export const IconRuler = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.2 16.8 16.8 3.2l4 4L7.2 20.8l-4-4Z" />
    <path d="m7 13 1.8 1.8M10 10l1.8 1.8M13 7l1.8 1.8" />
  </svg>
);

export const IconScissors = (p: P) => (
  <svg {...base(p)}>
    <circle cx="6.2" cy="6.5" r="2.6" />
    <circle cx="6.2" cy="17.5" r="2.6" />
    <path d="M8.5 7.8 20.5 19M8.5 16.2 20.5 5M13.6 12.6l-2.2 2" />
  </svg>
);

export const IconNeedle = (p: P) => (
  <svg {...base(p)}>
    <path d="M19.5 4.5c-6.5 1-11.7 5.4-14.6 12.6-.5 1.3-.9 2.6-1.1 3.9 1.3-.2 2.6-.6 3.9-1.1 7.2-2.9 11.6-8.1 12.6-14.6" />
    <path d="M17.2 6.8 19 5" />
    <path d="M4.5 20.5c3-3.5 6-4.8 9.5-5" />
  </svg>
);

export const IconSwatch = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 4h6v13.5a3 3 0 1 1-6 0V4Z" />
    <path d="M11 8.5 14.5 5 19 9.5l-8 8" />
    <path d="M14.5 17.5A3 3 0 1 1 11 17.5" />
    <circle cx="8" cy="17.5" r="0.4" fill="currentColor" />
  </svg>
);

export const IconTruck = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3v3.5h-7" />
    <circle cx="6.5" cy="17.5" r="1.8" />
    <circle cx="16.5" cy="17.5" r="1.8" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const IconArrow = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12h15M13.5 6l6 6-6 6" />
  </svg>
);

export const IconChevron = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 9.5 6 6 6-6" />
  </svg>
);

export const IconClose = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconMenu = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 8.5h17M3.5 15.5h11" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5.5v13M5.5 12h13" />
  </svg>
);

export const IconMinus = (p: P) => (
  <svg {...base(p)}>
    <path d="M5.5 12h13" />
  </svg>
);

export const IconTrash = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 6.5h15M9.5 6.5v-2h5v2M6.5 6.5l.8 13a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-13" />
    <path d="M10 10.5v6M14 10.5v6" />
  </svg>
);

export const IconUpload = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 15.5v-11M7.5 8.5 12 4l4.5 4.5" />
    <path d="M4.5 15.5v3a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-3" />
  </svg>
);

export const IconPhone = (p: P) => (
  <svg {...base(p)}>
    <path d="M5.5 4.5h4l1.5 4.5-2.3 1.7a12.5 12.5 0 0 0 4.6 4.6L15 13l4.5 1.5v4a1.6 1.6 0 0 1-1.8 1.6C10 19.5 4.5 14 3.9 6.3A1.6 1.6 0 0 1 5.5 4.5Z" />
  </svg>
);

export const IconMail = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
    <path d="m4.5 7.5 7.5 6 7.5-6" />
  </svg>
);

export const IconPin = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s6.5-6 6.5-11a6.5 6.5 0 1 0-13 0c0 5 6.5 11 6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
);

export const IconEdit = (p: P) => (
  <svg {...base(p)}>
    <path d="m14.5 5 4.5 4.5L8.5 20H4v-4.5L14.5 5Z" />
    <path d="m12.5 7 4.5 4.5" />
  </svg>
);

export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v5.2l3.4 2" />
  </svg>
);

export const IconCard = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="5.5" width="18" height="13" rx="1.8" />
    <path d="M3 10h18M6.5 14.5h4" />
  </svg>
);

export const IconDiamond = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M12 4l6 8-6 8-6-8 6-8Z" />
  </svg>
);

export const IconSparkle = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M12 3.5c.6 4.4 4.1 7.9 8.5 8.5-4.4.6-7.9 4.1-8.5 8.5-.6-4.4-4.1-7.9-8.5-8.5 4.4-.6 7.9-4.1 8.5-8.5Z" />
  </svg>
);

/* ------- social ------- */

export const IconInstagram = (p: P) => (
  <svg {...base(p)}>
    <rect x="4" y="4" width="16" height="16" rx="4.5" />
    <circle cx="12" cy="12" r="3.6" />
    <circle cx="16.6" cy="7.4" r="0.5" fill="currentColor" />
  </svg>
);

export const IconTikTok = (p: P) => (
  <svg {...base(p)}>
    <path d="M14.5 4v9.8a3.7 3.7 0 1 1-3.2-3.7" />
    <path d="M14.5 5.5c.6 2.4 2.3 4 4.9 4.3" />
  </svg>
);

export const IconFacebook = (p: P) => (
  <svg {...base(p)}>
    <path d="M15.5 4h-2.4a3.4 3.4 0 0 0-3.4 3.4V10H7.2v3.2h2.5V20h3.3v-6.8h2.6l.6-3.2h-3.2V7.9c0-.8.4-1.3 1.4-1.3h1.7V4Z" />
  </svg>
);

export const IconWhatsApp = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.8a8.2 8.2 0 0 0-7.1 12.3L3.8 20l4-1A8.2 8.2 0 1 0 12 3.8Z" />
    <path d="M9 8.8c-.4 1.8 1.6 5.4 4.8 6.3.9.3 1.8 0 2.1-.7l.3-.8-1.9-1-.8.7c-.9-.4-2-1.5-2.4-2.4l.7-.8-1-1.9-.9.3c-.5.2-.8.5-.9.9Z" strokeWidth="1.2" />
  </svg>
);

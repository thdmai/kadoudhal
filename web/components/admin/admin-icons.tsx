import type { ReactNode } from "react";

type IconProps = { className?: string };

function base(props: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden
    >
      {props.children}
    </svg>
  );
}

export function IconDashboard({ className }: IconProps) {
  return base({
    className,
    children: (
      <>
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </>
    ),
  });
}

export function IconHome({ className }: IconProps) {
  return base({
    className,
    children: (
      <>
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5 10.5V20h14v-9.5" />
      </>
    ),
  });
}

export function IconBook({ className }: IconProps) {
  return base({
    className,
    children: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </>
    ),
  });
}

export function IconScroll({ className }: IconProps) {
  return base({
    className,
    children: (
      <>
        <path d="M8 3h9a3 3 0 0 1 3 3v12a2 2 0 0 1-2 2H8" />
        <path d="M8 3a3 3 0 0 0-3 3v1h3" />
        <path d="M5 7v10a3 3 0 0 0 3 3" />
        <path d="M10 8h7M10 12h7M10 16h4" />
      </>
    ),
  });
}

export function IconScale({ className }: IconProps) {
  return base({
    className,
    children: (
      <>
        <path d="M12 3v18" />
        <path d="M5 7h14" />
        <path d="M5 7l-3 6h6L5 7z" />
        <path d="M19 7l-3 6h6l-3-6z" />
        <path d="M8 21h8" />
      </>
    ),
  });
}

export function IconUsers({ className }: IconProps) {
  return base({
    className,
    children: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  });
}

export function IconSettings({ className }: IconProps) {
  return base({
    className,
    children: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
  });
}

export function IconExternal({ className }: IconProps) {
  return base({
    className,
    children: (
      <>
        <path d="M14 4h6v6" />
        <path d="M10 14 20 4" />
        <path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
      </>
    ),
  });
}

export function IconLogout({ className }: IconProps) {
  return base({
    className,
    children: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </>
    ),
  });
}

export function IconArrow({ className }: IconProps) {
  return base({
    className,
    children: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
  });
}

export const adminIconMap = {
  dashboard: IconDashboard,
  accueil: IconHome,
  coran: IconBook,
  hadith: IconScroll,
  fiqh: IconScale,
  utilisateurs: IconUsers,
  reglages: IconSettings,
} as const;

export type AdminIconKey = keyof typeof adminIconMap;

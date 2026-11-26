import type { AdminIconKey } from "@/components/admin/admin-icons";

export type AdminNavKey =
  | "dashboard"
  | "accueil"
  | "coran"
  | "hadith"
  | "fiqh"
  | "utilisateurs"
  | "reglages";

export const adminNav = [
  { href: "/admin", key: "dashboard", icon: "dashboard", exact: true },
  { href: "/admin/accueil", key: "accueil", icon: "accueil" },
  { href: "/admin/coran", key: "coran", icon: "coran" },
  { href: "/admin/hadith", key: "hadith", icon: "hadith" },
  { href: "/admin/fiqh", key: "fiqh", icon: "fiqh" },
  { href: "/admin/utilisateurs", key: "utilisateurs", icon: "utilisateurs" },
  { href: "/admin/reglages", key: "reglages", icon: "reglages" },
] as const satisfies ReadonlyArray<{
  href: string;
  key: AdminNavKey;
  icon: AdminIconKey;
  exact?: boolean;
}>;

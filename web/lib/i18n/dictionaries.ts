import type { Locale } from "@/lib/i18n/config";
import adminEn from "@/messages/admin.en.json";
import adminFr from "@/messages/admin.fr.json";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

const dictionaries = {
  fr: { ...fr, admin: adminFr },
  en: { ...en, admin: adminEn },
} as const;

export type Dictionary = (typeof dictionaries)["fr"];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    values[key] !== undefined ? String(values[key]) : `{${key}}`,
  );
}

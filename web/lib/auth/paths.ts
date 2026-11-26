import type { Dictionary } from "@/lib/i18n/dictionaries";

const CONTENT = new Set(["/coran", "/hadith", "/fiqh"]);

export function safeContentPath(next: string | undefined, fallback = "/coran") {
  return next && CONTENT.has(next) ? next : fallback;
}

export function contentLabel(
  next: string,
  dictionary?: Dictionary["collections"],
) {
  if (!dictionary) {
    const fallback: Record<string, string> = {
      "/coran": "le Coran",
      "/hadith": "les hadiths",
      "/fiqh": "le fiqh",
    };
    return fallback[next] ?? "ce contenu";
  }

  if (next === "/coran") return dictionary.coran.contentLabel;
  if (next === "/hadith") return dictionary.hadith.contentLabel;
  if (next === "/fiqh") return dictionary.fiqh.contentLabel;
  return dictionary.fallbackLabel;
}

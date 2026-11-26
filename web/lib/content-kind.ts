export type KindLabels = {
  djouzou: string;
  soumin: string;
  seance: string;
  fallback: string;
};

const DEFAULT_KIND_LABELS: KindLabels = {
  djouzou: "Djouzou",
  soumin: "Soumin",
  seance: "Séance",
  fallback: "Séance",
};

/** Slug stocké en base (body_text) à partir d’un libellé ou d’une valeur saisie. */
export function normalizeKind(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function kindLabel(kind: string, labels: KindLabels = DEFAULT_KIND_LABELS): string {
  if (!kind) return labels.fallback;
  if (kind === "djouzou") return labels.djouzou;
  if (kind === "soumin") return labels.soumin;
  if (kind === "seance") return labels.seance;
  return kind
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

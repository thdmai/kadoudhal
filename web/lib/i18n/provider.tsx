"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "@/lib/i18n/config";
import {
  interpolate,
  type Dictionary,
} from "@/lib/i18n/dictionaries";

type I18nContextValue = {
  locale: Locale;
  dictionary: Dictionary;
  t: (
    path: string,
    values?: Record<string, string | number>,
  ) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readPath(dictionary: Dictionary, path: string): string {
  const parts = path.split(".");
  let current: unknown = dictionary;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return path;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : path;
}

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dictionary,
      t: (path, values) => {
        const raw = readPath(dictionary, path);
        return values ? interpolate(raw, values) : raw;
      },
    }),
    [locale, dictionary],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

export function useDictionary() {
  return useI18n().dictionary;
}

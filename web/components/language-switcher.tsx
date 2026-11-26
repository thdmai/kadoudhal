"use client";

import { setLocaleAction } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";

type LanguageSwitcherProps = {
  className?: string;
  /** `dark` = header site, `light` = sidebar admin */
  variant?: "dark" | "light";
};

const OPTIONS: Locale[] = ["fr", "en"];

export function LanguageSwitcher({
  className = "",
  variant = "dark",
}: LanguageSwitcherProps) {
  const { locale, dictionary } = useI18n();

  const shell =
    variant === "light"
      ? "border-[var(--admin-border)]"
      : "border-gold/90 rounded-[30px]";
  const activeClass =
    variant === "light"
      ? "rounded-full bg-[var(--admin-accent)]/15 text-[var(--admin-accent)]"
      : "rounded-full bg-gold/30 text-white";
  const idleClass =
    variant === "light"
      ? "rounded-full text-[var(--admin-muted)] hover:text-[var(--admin-accent)]"
      : "rounded-full text-white hover:text-gold";

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border p-0.5 text-xs tracking-wide ${shell} ${className}`}
      role="group"
      aria-label={dictionary.nav.language}
    >
      {OPTIONS.map((option) => {
        const active = locale === option;
        return (
          <button
            key={option}
            type="button"
            className={`px-2.5 py-1 transition-colors ${
              active ? activeClass : idleClass
            }`}
            aria-pressed={active}
            onClick={() => {
              if (!active) void setLocaleAction(option);
            }}
          >
            {dictionary.nav[option]}
          </button>
        );
      })}
    </div>
  );
}

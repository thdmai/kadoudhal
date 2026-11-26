"use client";

import Link from "next/link";
import { signOutAction } from "@/app/auth/actions";
import { useDictionary, useI18n } from "@/lib/i18n/provider";
import { interpolate } from "@/lib/i18n/dictionaries";

type ProfileMenuProps = {
  initials: string;
  displayName: string;
  isAdmin?: boolean;
};

export function ProfileMenu({
  initials,
  displayName,
  isAdmin = false,
}: ProfileMenuProps) {
  const dictionary = useDictionary();
  const { t } = useI18n();

  return (
    <details className="group relative">
      <summary
        className="flex cursor-pointer list-none items-center justify-center rounded-full border border-gold/50 bg-card px-0 text-sm font-semibold tracking-wide text-gold outline-none marker:content-none [&::-webkit-details-marker]:hidden size-10 hover:border-gold hover:bg-field focus-visible:ring-2 focus-visible:ring-gold/40"
        aria-label={interpolate(dictionary.profile.menuAria, {
          name: displayName,
        })}
        title={displayName}
      >
        {initials}
      </summary>
      <div className="absolute end-0 z-40 mt-2 w-56 overflow-hidden rounded-md border border-gold/30 bg-card shadow-lg">
        <p className="border-b border-gold/20 px-4 py-3 text-sm text-white/80 truncate">
          {displayName}
        </p>
        <nav className="flex flex-col py-1">
          {isAdmin ? (
            <Link
              href="/admin"
              className="px-4 py-2.5 text-sm text-white/90 transition-colors hover:bg-field hover:text-gold"
            >
              {t("profile.admin")}
            </Link>
          ) : null}
          <Link
            href="/profil"
            className="px-4 py-2.5 text-sm text-white/90 transition-colors hover:bg-field hover:text-gold"
          >
            {t("profile.edit")}
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full px-4 py-2.5 text-start text-sm text-white/90 transition-colors hover:bg-field hover:text-gold"
            >
              {t("profile.signOut")}
            </button>
          </form>
        </nav>
      </div>
    </details>
  );
}

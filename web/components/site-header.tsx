import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ProfileMenu } from "@/components/profile-menu";
import { getSessionProfile } from "@/lib/auth/profile";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export async function SiteHeader() {
  const profile = await getSessionProfile();
  const locale = await getLocale();
  const dictionary = getDictionary(locale);

  const links = [
    { href: "/", label: dictionary.nav.home },
    { href: "/coran", label: dictionary.nav.coran },
    { href: "/hadith", label: dictionary.nav.hadith },
    { href: "/fiqh", label: dictionary.nav.fiqh },
  ];

  return (
    <header className="relative z-30 border-b border-gold/25 bg-ink">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4 md:gap-6">
        <BrandLogo href="/" variant="dark" />

        <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
          {/* Desktop uniquement — pas dans le header mobile */}
          <div className="hidden md:block">
            <LanguageSwitcher variant="dark" />
          </div>

          <input id="site-nav" type="checkbox" className="peer/nav sr-only" />
          <label
            htmlFor="site-nav"
            className="cursor-pointer rounded-md border border-gold/40 px-3 py-1.5 text-sm text-white md:hidden"
          >
            {dictionary.nav.menu}
          </label>

          <nav className="absolute inset-x-0 top-full z-20 hidden flex-col gap-1 border-b border-gold/25 bg-ink px-5 py-3 peer-checked/nav:flex md:static md:flex md:flex-row md:items-center md:gap-7 md:border-0 md:bg-transparent md:p-0">
            {/* Mobile : FR|EN + initiales sur une ligne, dans le Menu */}
            <div className="flex items-center justify-between gap-3 border-b border-gold/20 pb-3 md:hidden">
              <LanguageSwitcher variant="dark" />
              {profile ? (
                <ProfileMenu
                  initials={profile.initials}
                  displayName={profile.displayName}
                  isAdmin={profile.role === "admin"}
                />
              ) : null}
            </div>

            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-2 text-[0.95rem] tracking-wide text-white/90 transition-colors hover:text-gold md:py-0"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop : profil dans la barre */}
          {profile ? (
            <div className="hidden md:block">
              <ProfileMenu
                initials={profile.initials}
                displayName={profile.displayName}
                isAdmin={profile.role === "admin"}
              />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

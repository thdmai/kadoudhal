"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/auth/actions";
import {
  IconExternal,
  IconLogout,
  adminIconMap,
} from "@/components/admin/admin-icons";
import { BrandLogo } from "@/components/brand-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { adminNav } from "@/lib/admin/nav";
import { useDictionary } from "@/lib/i18n/provider";

type AdminSidebarProps = {
  displayName: string;
  initials: string;
  email: string;
};

export function AdminSidebar({
  displayName,
  initials,
  email,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const dictionary = useDictionary();
  const admin = dictionary.admin;

  return (
    <aside className="admin-sidebar flex w-full flex-col border-b border-[var(--admin-border)] lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-e">
      <div className="flex items-start justify-between gap-2 px-5 py-5">
        <BrandLogo
          href="/admin"
          variant="light"
          subtitle={admin.brandSubtitle}
        />
        <LanguageSwitcher variant="light" className="mt-1 shrink-0 border border-3" />
      </div>

      <div className="mx-5 mb-4 flex items-center gap-3 rounded-xl border border-[var(--admin-border)] bg-gradient-to-br from-white to-[var(--admin-soft)] px-3 py-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <span className="admin-on-accent flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold shadow-md [background:var(--admin-grad)]">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--admin-ink)]">
            {displayName}
          </p>
          <p className="truncate text-xs text-[var(--admin-muted)]">{email}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 pb-4">
        <p className="px-2 pb-2 text-[0.7rem] font-semibold tracking-wider text-[var(--admin-muted)] uppercase">
          {admin.navSection}
        </p>
        {adminNav.map((item) => {
          const exact = "exact" in item && item.exact;
          const active = exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = adminIconMap[item.icon];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-link group flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm ${
                active
                  ? "admin-nav-link-active admin-on-accent bg-[var(--admin-accent)] font-semibold"
                  : "text-[var(--admin-ink)]"
              }`}
            >
              <Icon className="size-[1.1rem] shrink-0 opacity-90 transition-transform duration-200 group-hover:scale-110" />
              <span>{admin.nav[item.key]}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 border-t border-[var(--admin-border)] px-3 py-4">
        <Link
          href="/"
          className="admin-nav-link group flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-[var(--admin-ink)]"
        >
          <IconExternal className="size-[1.1rem] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          {admin.viewSite}
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="admin-nav-link group flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-start text-sm text-[var(--admin-ink)]"
          >
            <IconLogout className="size-[1.1rem] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
            {admin.signOut}
          </button>
        </form>
      </div>
    </aside>
  );
}

import type { ReactNode } from "react";

type AdminTopbarProps = {
  title: string;
  titleAr?: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
};

export function AdminTopbar({
  title,
  titleAr,
  subtitle,
  icon,
  actions,
}: AdminTopbarProps) {
  return (
    <header className="admin-topbar border-b border-[var(--admin-border)] bg-white px-5 py-4 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? (
            <span className="admin-shortcut-icon mt-0.5 shrink-0 shadow-md">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0">
            <h1 className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-display text-3xl text-[var(--admin-ink)]">
              <span>{title}</span>
              {titleAr ? (
                <>
                  <span className="text-[var(--admin-muted)]" aria-hidden>
                    —
                  </span>
                  <span
                    className="font-arabic text-2xl text-[var(--admin-accent)]"
                    dir="rtl"
                    lang="ar"
                  >
                    {titleAr}
                  </span>
                </>
              ) : null}
            </h1>
            {subtitle ? (
              <p className="mt-1 text-sm text-[var(--admin-muted)]">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

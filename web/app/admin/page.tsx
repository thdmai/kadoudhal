import Link from "next/link";
import {
  IconArrow,
  adminIconMap,
  type AdminIconKey,
} from "@/components/admin/admin-icons";
import {
  BarChart,
  DonutChart,
  LeadCard,
  LineChart,
  ProgressStat,
  RingStat,
} from "@/components/admin/dashboard-widgets";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { initialsFrom } from "@/lib/auth/profile";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { createClient } from "@/lib/supabase/server";

type Collection = "coran" | "hadith" | "fiqh";

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string, locale: string) {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
    month: "short",
  });
}

function lastSixMonthKeys() {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

export default async function AdminDashboardPage() {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const t = dictionary.admin.dashboard;
  const nav = dictionary.admin.nav;
  const supabase = await createClient();

  const [
    { count: usersActive },
    { count: usersTotal },
    { count: sections },
    { count: tracksPublished },
    { count: tracksDraft },
    { count: admins },
    { data: sectionRows },
    { data: recentUsers },
    { data: profileDates },
    { data: trackDates },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("sections")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase
      .from("tracks")
      .select("*", { count: "exact", head: true })
      .eq("published", true)
      .is("deleted_at", null),
    supabase
      .from("tracks")
      .select("*", { count: "exact", head: true })
      .eq("published", false)
      .is("deleted_at", null),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin")
      .is("deleted_at", null),
    supabase.from("sections").select("collection").is("deleted_at", null),
    supabase
      .from("profiles")
      .select("id, email, display_name, role, deleted_at")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase.from("profiles").select("created_at").order("created_at"),
    supabase
      .from("tracks")
      .select("created_at, published")
      .is("deleted_at", null)
      .order("created_at"),
  ]);

  const active = usersActive ?? 0;
  const totalUsers = usersTotal ?? 0;
  const sectionCount = sections ?? 0;
  const published = tracksPublished ?? 0;
  const drafts = tracksDraft ?? 0;
  const adminCount = admins ?? 0;
  const tracksTotal = published + drafts;

  const byCollection: Record<Collection, number> = {
    coran: 0,
    hadith: 0,
    fiqh: 0,
  };
  for (const row of sectionRows ?? []) {
    const c = row.collection as Collection;
    if (c in byCollection) byCollection[c] += 1;
  }

  const months = lastSixMonthKeys();
  const usersPerMonth = Object.fromEntries(months.map((k) => [k, 0])) as Record<
    string,
    number
  >;
  const publishedPerMonth = { ...usersPerMonth };
  const draftPerMonth = { ...usersPerMonth };

  for (const row of profileDates ?? []) {
    const key = monthKey(new Date(row.created_at));
    if (key in usersPerMonth) usersPerMonth[key] += 1;
  }
  for (const row of trackDates ?? []) {
    const key = monthKey(new Date(row.created_at));
    if (!(key in publishedPerMonth)) continue;
    if (row.published) publishedPerMonth[key] += 1;
    else draftPerMonth[key] += 1;
  }

  const activePct = totalUsers ? (active / totalUsers) * 100 : 0;
  const publishedPct = tracksTotal ? (published / tracksTotal) * 100 : 0;
  const sectionFill = Math.min(100, sectionCount * 8);
  const draftPct = tracksTotal ? (drafts / tracksTotal) * 100 : 0;

  const shortcuts: {
    href: string;
    title: string;
    hint: string;
    icon: AdminIconKey;
  }[] = (
    [
      ["accueil", "/admin/accueil"],
      ["coran", "/admin/coran"],
      ["hadith", "/admin/hadith"],
      ["fiqh", "/admin/fiqh"],
      ["utilisateurs", "/admin/utilisateurs"],
      ["reglages", "/admin/reglages"],
    ] as const
  ).map(([key, href]) => ({
    href,
    title: nav[key],
    hint: t.hints[key],
    icon: key as AdminIconKey,
  }));

  return (
    <>
      <AdminTopbar
        title={t.title}
        subtitle={t.subtitle}
        icon={<adminIconMap.dashboard className="size-5" />}
      />
      <main className="space-y-6 px-5 py-6 lg:px-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="admin-fade-up" style={{ animationDelay: "0ms" }}>
            <RingStat
              title={t.activeAccounts}
              value={active}
              caption={t.activeUsers}
              percent={activePct}
              color="#ef5f5f"
            />
          </div>
          <div className="admin-fade-up" style={{ animationDelay: "60ms" }}>
            <ProgressStat
              title={t.publishedTracks}
              value={published}
              caption={t.audioCatalog}
              percent={publishedPct}
              badge={`${Math.round(publishedPct)}%`}
              color="#22c55e"
            />
          </div>
          <div className="admin-fade-up" style={{ animationDelay: "120ms" }}>
            <RingStat
              title={t.sections}
              value={sectionCount}
              caption={t.collectionsCaption}
              percent={sectionFill}
              color="#eab308"
            />
          </div>
          <div className="admin-fade-up" style={{ animationDelay: "180ms" }}>
            <ProgressStat
              title={t.drafts}
              value={drafts}
              caption={t.unpublishedTracks}
              percent={draftPct || 8}
              badge={interpolate(
                adminCount > 1 ? t.adminBadgeMany : t.adminBadge,
                { count: adminCount },
              )}
              color="#ec4899"
            />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="admin-fade-up" style={{ animationDelay: "120ms" }}>
            <DonutChart
              title={t.sectionsSplit}
              centerLabel={t.total}
              centerValue={sectionCount}
              slices={[
                {
                  label: nav.coran,
                  value: byCollection.coran,
                  color: "#7dd3fc",
                },
                {
                  label: nav.hadith,
                  value: byCollection.hadith,
                  color: "#3b82f6",
                },
                { label: nav.fiqh, value: byCollection.fiqh, color: "#f472b6" },
              ]}
            />
          </div>
          <div className="admin-fade-up" style={{ animationDelay: "180ms" }}>
            <BarChart
              title={t.sectionsByCollection}
              bars={[
                { label: nav.coran, value: byCollection.coran },
                { label: nav.hadith, value: byCollection.hadith },
                { label: nav.fiqh, value: byCollection.fiqh },
              ]}
              color="#5b8def"
            />
          </div>
          <div className="admin-fade-up" style={{ animationDelay: "240ms" }}>
            <LineChart
              title={t.activity}
              labels={months.map((k) => monthLabel(k, locale))}
              series={[
                {
                  label: t.signups,
                  color: "#22c55e",
                  values: months.map((k) => usersPerMonth[k] ?? 0),
                },
                {
                  label: t.publishedTracks,
                  color: "#3b82f6",
                  values: months.map((k) => publishedPerMonth[k] ?? 0),
                },
                {
                  label: t.drafts,
                  color: "#f472b6",
                  values: months.map((k) => draftPerMonth[k] ?? 0),
                },
              ]}
            />
          </div>
        </section>

        <section className="admin-fade-up" style={{ animationDelay: "200ms" }}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-[var(--admin-ink)]">
              {t.recentAccounts}
            </h2>
            <Link
              href="/admin/utilisateurs"
              className="text-sm font-medium text-[var(--admin-accent)] transition-opacity hover:opacity-80"
            >
              {t.seeAll}
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {(recentUsers ?? []).map((user) => {
              const name = user.display_name?.trim() || user.email;
              return (
                <LeadCard
                  key={user.id}
                  name={name}
                  email={user.email}
                  initials={initialsFrom(name, user.email)}
                  role={
                    user.deleted_at
                      ? t.roleDisabled
                      : user.role === "admin"
                        ? t.roleAdmin
                        : t.roleUser
                  }
                />
              );
            })}
            {(recentUsers ?? []).length === 0 ? (
              <p className="admin-card col-span-full px-4 py-8 text-center text-sm text-[var(--admin-muted)] shadow-sm">
                {t.noAccounts}
              </p>
            ) : null}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((link, index) => {
            const Icon = adminIconMap[link.icon];
            return (
              <Link
                key={link.href}
                href={link.href}
                className="admin-card admin-shortcut admin-fade-up"
                style={{ animationDelay: `${220 + index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span className="admin-shortcut-icon">
                    <Icon className="size-5" />
                  </span>
                  <IconArrow className="admin-shortcut-arrow size-4" />
                </div>
                <p className="font-display text-xl text-[var(--admin-ink)]">
                  {link.title}
                </p>
                <p className="text-sm text-[var(--admin-muted)]">{link.hint}</p>
              </Link>
            );
          })}
        </section>
      </main>
    </>
  );
}

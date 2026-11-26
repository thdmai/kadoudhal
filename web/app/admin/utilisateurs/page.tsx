import { adminIconMap } from "@/components/admin/admin-icons";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { UserActions } from "@/components/admin/user-actions";
import { requireAdmin } from "@/lib/auth/admin";
import { initialsFrom } from "@/lib/auth/profile";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { createClient } from "@/lib/supabase/server";

function formatDate(value: string | null, locale: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const t = dictionary.admin.users;
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select(
      "id, email, display_name, role, deleted_at, last_seen_at, created_at",
    )
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminTopbar
        title={t.title}
        subtitle={t.subtitle}
        icon={<adminIconMap.utilisateurs className="size-5" />}
      />
      <main className="px-5 py-6 lg:px-8">
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--admin-border)] bg-[var(--admin-soft)] text-[var(--admin-muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t.account}</th>
                  <th className="px-4 py-3 font-semibold">{t.role}</th>
                  <th className="px-4 py-3 font-semibold">{t.lastActivity}</th>
                  <th className="px-4 py-3 font-semibold">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                {(users ?? []).map((user) => {
                  const name = user.display_name?.trim() || user.email;
                  const isActive = !user.deleted_at;
                  const role = user.role === "admin" ? "admin" : "user";

                  return (
                    <tr key={user.id} className="align-middle">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--admin-soft)] text-xs font-semibold text-[var(--admin-accent)]">
                            {initialsFrom(name, user.email)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[var(--admin-ink)]">
                              {name}
                              {user.id === admin.id ? (
                                <span className="ms-2 text-xs font-normal text-[var(--admin-muted)]">
                                  {t.you}
                                </span>
                              ) : null}
                            </p>
                            <p className="truncate text-xs text-[var(--admin-muted)]">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {!isActive ? (
                          <span className="admin-badge admin-badge-off">
                            {t.disabled}
                          </span>
                        ) : role === "admin" ? (
                          <span className="admin-badge admin-badge-admin">
                            {t.admin}
                          </span>
                        ) : (
                          <span className="admin-badge admin-badge-user">
                            {t.user}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[var(--admin-ink)]">
                        {user.last_seen_at ? (
                          formatDate(user.last_seen_at, locale)
                        ) : (
                          <span
                            className="text-[var(--admin-muted)]"
                            title={t.lastSeenUnknown}
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <UserActions
                          userId={user.id}
                          role={role}
                          isActive={isActive}
                          isSelf={user.id === admin.id}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {(users ?? []).length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-[var(--admin-muted)]">
              {t.empty}
            </p>
          ) : null}
        </div>
      </main>
    </>
  );
}

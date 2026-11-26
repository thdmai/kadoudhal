import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/auth/admin";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  return { title: dictionary.admin.metaTitle };
}

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const admin = await requireAdmin();

  return (
    <div className="admin-shell min-h-screen lg:flex">
      <AdminSidebar
        displayName={admin.displayName}
        initials={admin.initials}
        email={admin.email}
      />
      <div className="admin-main flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

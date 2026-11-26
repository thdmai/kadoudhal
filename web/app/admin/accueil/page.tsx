import { AddHomeBlockCard } from "@/components/admin/add-home-block-card";
import { adminIconMap } from "@/components/admin/admin-icons";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { HomeBlockForm } from "@/components/admin/home-block-form";
import { getSiteSettings } from "@/lib/admin/settings";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHomePage() {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const t = dictionary.admin.home;
  const supabase = await createClient();
  const [{ data: blocks }, settings] = await Promise.all([
    supabase
      .from("home_blocks")
      .select("id, slug, title, title_ar, excerpt, image_url")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true }),
    getSiteSettings(),
  ]);

  return (
    <>
      <AdminTopbar
        title={t.title}
        subtitle={t.subtitle}
        icon={<adminIconMap.accueil className="size-5" />}
      />
      <main className="grid gap-4 px-5 py-6 sm:grid-cols-2 xl:grid-cols-4 lg:px-8">
        <AddHomeBlockCard maxImageBytes={settings.maxHomeImageBytes} />
        {(blocks ?? []).map((block) => (
          <HomeBlockForm
            key={block.id}
            block={block}
            maxImageBytes={settings.maxHomeImageBytes}
          />
        ))}
        {(blocks ?? []).length === 0 ? (
          <p className="text-sm text-[var(--admin-muted)] sm:col-span-2 xl:col-span-3">
            {t.empty}
          </p>
        ) : null}
      </main>
    </>
  );
}

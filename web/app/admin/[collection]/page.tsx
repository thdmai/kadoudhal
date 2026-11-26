import { notFound } from "next/navigation";
import { adminIconMap } from "@/components/admin/admin-icons";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { CollectionManager } from "@/components/admin/collection-manager";
import { loadCollectionSections } from "@/lib/admin/load-collection";
import { getSiteSettings } from "@/lib/admin/settings";
import {
  collectionMeta,
  type ContentCollection,
} from "@/lib/home";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

const collections = new Set<string>(Object.keys(collectionMeta));

const collectionIcons = {
  coran: adminIconMap.coran,
  hadith: adminIconMap.hadith,
  fiqh: adminIconMap.fiqh,
} as const;

type PageProps = {
  params: Promise<{ collection: string }>;
};

export default async function AdminCollectionPage({ params }: PageProps) {
  const { collection: raw } = await params;
  if (!collections.has(raw)) notFound();

  const collection = raw as ContentCollection;
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const [{ meta, sections }, settings] = await Promise.all([
    loadCollectionSections(collection),
    getSiteSettings(),
  ]);
  const Icon = collectionIcons[collection];
  const title =
    locale === "en"
      ? dictionary.admin.nav[collection]
      : meta.title;
  const unit = dictionary.collections[collection].unit;

  return (
    <>
      <AdminTopbar
        title={title}
        titleAr={meta.titleAr}
        subtitle={dictionary.admin.collection.subtitle}
        icon={<Icon className="size-5" />}
      />
      <main className="px-5 py-6 lg:px-8">
        <CollectionManager
          collection={collection}
          unit={unit}
          sections={sections}
          maxAudioBytes={settings.maxAudioBytes}
          maxCoverBytes={settings.maxCoverBytes}
          coranKinds={settings.coranKinds}
        />
      </main>
    </>
  );
}

import { notFound, redirect } from "next/navigation";
import { ContentLibrary } from "@/components/content-library";
import { getSessionProfile } from "@/lib/auth/profile";
import { loadPublicCollection } from "@/lib/content-data";
import { collectionMeta, type ContentCollection } from "@/lib/home";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

const slugs = new Set<string>(Object.keys(collectionMeta));

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;
  if (!slugs.has(slug)) notFound();

  const collection = slug as ContentCollection;
  const profile = await getSessionProfile();
  if (!profile) {
    redirect(`/connexion?next=/${collection}`);
  }

  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const { meta, sections } = await loadPublicCollection(collection);
  const localized = dictionary.collections[collection];
  const title =
    locale === "en"
      ? collection === "coran"
        ? dictionary.nav.coran
        : collection === "hadith"
          ? dictionary.nav.hadith
          : dictionary.nav.fiqh
      : meta.title;

  return (
    <ContentLibrary
      title={title}
      titleAr={meta.titleAr}
      unit={localized.unit}
      sections={sections}
    />
  );
}

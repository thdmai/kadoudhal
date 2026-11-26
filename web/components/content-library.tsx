import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ContentSearchList } from "@/components/content-search-list";
import type { PublicSection } from "@/lib/content-data";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

type ContentLibraryProps = {
  title: string;
  titleAr: string;
  unit: string;
  sections: PublicSection[];
};

export async function ContentLibrary({
  title,
  titleAr,
  unit,
  sections,
}: ContentLibraryProps) {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const unitLower = unit.toLowerCase();
  const intro =
    sections.length === 0
      ? interpolate(dictionary.content.empty, { unit: unitLower })
      : interpolate(dictionary.content.intro, { unit: unitLower });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-10">
        <ContentSearchList
          sections={sections}
          unit={unit}
          title={title}
          titleAr={titleAr}
          intro={intro}
        />
      </main>
      <SiteFooter />
    </>
  );
}

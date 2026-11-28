import { HomeBlocks } from "@/components/home-blocks";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getHomeBlocks } from "@/lib/home-data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export default async function Home() {
  const blocks = await getHomeBlocks();
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const cols =
    blocks.length >= 4
      ? "md:grid-cols-2 xl:grid-cols-4"
      : blocks.length === 2
        ? "md:grid-cols-2"
        : "md:grid-cols-3";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-10">
        <p
          className="site-fade-up font-arabic text-center text-3xl text-gold sm:text-4xl"
          style={{ animationDelay: "0ms" }}
        >
          السلام عليكم ورحمة الله
        </p>
        <h1
          className="site-fade-up mt-4 text-center font-display text-4xl text-white sm:text-5xl"
          style={{ animationDelay: "80ms" }}
        >
          Kadoudhal
        </h1>
        <p
          className="site-fade-up mx-auto mt-3 max-w-xl text-center text-lg text-white/90"
          style={{ animationDelay: "160ms" }}
        >
          {dictionary.home.tagline}
        </p>

        <HomeBlocks
          blocks={blocks}
          locale={locale}
          dictionary={dictionary}
          cols={cols}
        />
      </main>
      <SiteFooter />
    </>
  );
}

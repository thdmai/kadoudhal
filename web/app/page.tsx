import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getHomeBlocks } from "@/lib/home-data";
import { isContentCollection, type ContentCollection } from "@/lib/home";
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
        <p className="font-arabic text-center text-3xl text-gold sm:text-4xl">
          السلام عليكم ورحمة الله
        </p>
        <h1 className="mt-4 text-center font-display text-4xl text-white sm:text-5xl">
          Kadoudhal
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-lg text-white/90">
          {dictionary.home.tagline}
        </p>

        <section className={`mt-10 grid gap-6 ${cols}`}>
          {blocks.map((block, index) => {
            const cardClass =
              "group flex flex-col overflow-hidden rounded-md border border-gold/30 bg-card transition-colors hover:border-gold";
            const collection = isContentCollection(block.slug)
              ? (block.slug as ContentCollection)
              : null;
            const localized = collection
              ? dictionary.collections[collection]
              : null;
            // FR: textes CMS ; EN: libellés UI pour les collections connues.
            const excerpt =
              locale === "en" && localized
                ? localized.excerpt
                : block.excerpt;
            const imageAlt =
              locale === "en" && localized
                ? localized.imageAlt
                : block.imageAlt;
            const title =
              locale === "en" && collection
                ? collection === "coran"
                  ? dictionary.nav.coran
                  : collection === "hadith"
                    ? dictionary.nav.hadith
                    : dictionary.nav.fiqh
                : block.title;

            const body = (
              <>
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={block.image}
                    alt={imageAlt}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized={block.image.startsWith("http")}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 px-5 py-5">
                  <h2 className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-display text-3xl text-white">
                      {title}
                    </span>
                    {block.titleAr ? (
                      <>
                        <span className="text-white/40" aria-hidden>
                          —
                        </span>
                        <span className="font-arabic text-2xl text-gold">
                          {block.titleAr}
                        </span>
                      </>
                    ) : null}
                  </h2>
                  <p className="text-base leading-7 text-white/85">{excerpt}</p>
                  {collection ? (
                    <span className="mt-auto pt-4 text-sm tracking-widest text-gold uppercase">
                      {dictionary.home.open}
                    </span>
                  ) : null}
                </div>
              </>
            );

            if (collection) {
              return (
                <Link
                  key={block.slug}
                  href={`/${block.slug}`}
                  className={cardClass}
                >
                  {body}
                </Link>
              );
            }

            return (
              <article key={block.slug} className={cardClass}>
                {body}
              </article>
            );
          })}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

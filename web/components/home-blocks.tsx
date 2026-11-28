import Image from "next/image";
import Link from "next/link";
import type { HomeBlock } from "@/lib/home";
import { isContentCollection, type ContentCollection } from "@/lib/home";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type HomeBlocksProps = {
  blocks: HomeBlock[];
  locale: Locale;
  dictionary: Dictionary;
  cols: string;
};

export function HomeBlocks({
  blocks,
  locale,
  dictionary,
  cols,
}: HomeBlocksProps) {
  return (
    <section className={`mt-10 grid gap-6 ${cols}`}>
      {blocks.map((block, index) => {
        const collection = isContentCollection(block.slug)
          ? (block.slug as ContentCollection)
          : null;
        const localized = collection
          ? dictionary.collections[collection]
          : null;
        const excerpt =
          locale === "en" && localized ? localized.excerpt : block.excerpt;
        const imageAlt =
          locale === "en" && localized ? localized.imageAlt : block.imageAlt;
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
                className="object-cover transition-transform duration-500 group-hover:scale-105 group-active:scale-105"
                unoptimized={block.image.startsWith("http")}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80" />
            </div>
            <div className="flex flex-1 flex-col gap-2 px-5 py-5">
              <h2 className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display text-3xl text-white">{title}</span>
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
                <span className="home-card-cta mt-auto pt-4 text-sm tracking-widest text-gold uppercase">
                  {dictionary.home.open}
                </span>
              ) : null}
            </div>
          </>
        );

        const cardClass =
          "home-card site-fade-up group flex flex-col overflow-hidden rounded-md border border-gold/30 bg-card";
        const style = { animationDelay: `${220 + index * 90}ms` };

        if (collection) {
          return (
            <Link
              key={block.slug}
              href={`/${block.slug}`}
              className={cardClass}
              style={style}
            >
              {body}
            </Link>
          );
        }

        return (
          <article key={block.slug} className={cardClass} style={style}>
            {body}
          </article>
        );
      })}
    </section>
  );
}

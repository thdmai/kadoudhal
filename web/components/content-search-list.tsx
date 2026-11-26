"use client";

import { useMemo, useState } from "react";
import { SectionAccordion } from "@/components/section-accordion";
import type { PublicSection } from "@/lib/content-data";
import { kindLabel } from "@/lib/content-kind";
import { interpolate } from "@/lib/i18n/dictionaries";
import { useDictionary } from "@/lib/i18n/provider";

type ContentSearchListProps = {
  sections: PublicSection[];
  unit: string;
  title: string;
  titleAr: string;
  intro: string;
};

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function filterSections(
  sections: PublicSection[],
  rawQuery: string,
): PublicSection[] {
  const q = normalize(rawQuery);
  if (!q) return sections;

  const result: PublicSection[] = [];

  for (const section of sections) {
    const sectionHit =
      normalize(String(section.number)).includes(q) ||
      normalize(section.title).includes(q) ||
      normalize(section.titleAr).includes(q);

    const matchingTracks = section.tracks.filter((track) => {
      const label = kindLabel(track.kind);
      return (
        normalize(track.title).includes(q) ||
        normalize(track.kind).includes(q) ||
        normalize(label).includes(q)
      );
    });

    if (sectionHit) {
      result.push(section);
    } else if (matchingTracks.length > 0) {
      result.push({ ...section, tracks: matchingTracks });
    }
  }

  return result;
}

export function ContentSearchList({
  sections,
  unit,
  title,
  titleAr,
  intro,
}: ContentSearchListProps) {
  const dictionary = useDictionary();
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => filterSections(sections, query),
    [sections, query],
  );

  const searching = query.trim().length > 0;

  return (
    <div>
      {/*
        Mobile : titre → texte → recherche
        Desktop : titre + recherche (même ligne), puis texte
      */}
      <div className="flex flex-col gap-3 sm:gap-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="font-display text-4xl text-white">{title}</h1>
              {titleAr ? (
                <p className="font-arabic text-3xl text-gold">{titleAr}</p>
              ) : null}
            </div>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-white/90">
              {intro}
            </p>
          </div>

          <label className="sr-only" htmlFor="content-search">
            {dictionary.content.searchPlaceholder}
          </label>
          <div className="relative order-last w-full shrink-0 sm:order-none sm:mt-1 sm:w-72 md:w-80">
            <i
              className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-gold/80 not-italic"
              aria-hidden
            >
              ⌕
            </i>
            <input
              id="content-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={dictionary.content.searchPlaceholder}
              className="w-full rounded-md border border-gold/35 bg-white/5 py-2.5 pe-3 ps-9 text-sm text-white outline-none placeholder:text-white/45 focus:border-gold focus:ring-2 focus:ring-gold/30"
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      <div className="mt-10">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-base text-white/70">
            {searching
              ? interpolate(dictionary.content.searchEmpty, {
                  query: query.trim(),
                })
              : interpolate(dictionary.content.empty, {
                  unit: unit.toLowerCase(),
                })}
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((section, index) => (
              <SectionAccordion
                key={`${section.id}-${searching ? "q" : "all"}`}
                section={section}
                unit={unit}
                defaultOpen={searching || index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

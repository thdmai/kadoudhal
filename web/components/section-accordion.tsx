"use client";

import { useId, useState } from "react";
import { SessionRow } from "@/components/session-row";
import type { PublicSection } from "@/lib/content-data";
import { interpolate } from "@/lib/i18n/dictionaries";
import { useDictionary } from "@/lib/i18n/provider";

type SectionAccordionProps = {
  section: PublicSection;
  unit: string;
  defaultOpen?: boolean;
};

const PREVIEW = 3;

export function SectionAccordion({
  section,
  unit,
  defaultOpen = false,
}: SectionAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [showAll, setShowAll] = useState(false);
  const panelId = useId();
  const dictionary = useDictionary();

  const tracks = section.tracks;
  const long = tracks.length > PREVIEW;
  const visible =
    open && long && !showAll ? tracks.slice(0, PREVIEW) : open ? tracks : [];
  const remaining = tracks.length - PREVIEW;
  const sessionLabel = interpolate(
    tracks.length > 1
      ? dictionary.content.sessionMany
      : dictionary.content.sessionOne,
    { count: tracks.length },
  );

  return (
    <section className="border-b border-white/15 pb-2">
      <button
        type="button"
        className="flex w-full text-white items-start justify-between gap-4 py-3 text-start outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-gold/50"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0 space-y-1.5">
          <p className="font-display text-base font-semibold uppercase tracking-[0.18em] text-gold sm:text-lg">
            {unit} {section.number}
          </p>
          <h2 className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-display text-3xl font-semibold text-white sm:text-4xl">
            <span>{section.title}</span>
            {section.titleAr ? (
              <>
                <span className="text-white/40" aria-hidden>
                  —
                </span>
                <span className="font-arabic text-2xl text-gold sm:text-3xl">
                  {section.titleAr}
                </span>
              </>
            ) : null}
          </h2>
          <p className="pt-0.5 text-sm font-medium text-white/80 sm:text-base">
            {sessionLabel}
            {!open
              ? ` · ${dictionary.content.open}`
              : ` · ${dictionary.content.collapse}`}
          </p>
        </div>
        <i
          className={`mt-1 inline-block shrink-0 text-2xl not-italic leading-none text-gold transition duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          ▾
        </i>
      </button>

      {open ? (
        <div id={panelId} className="space-y-3 pb-4 pt-2">
          <ul className="space-y-2.5">
            {visible.map((track) => (
              <SessionRow
                key={track.id}
                title={track.title}
                kind={track.kind}
                coverUrl={track.coverUrl}
                audioUrl={track.audioUrl}
              />
            ))}
          </ul>

          {long ? (
            <button
              type="button"
              className="text-sm font-medium text-gold underline-offset-2 hover:underline"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll
                ? dictionary.content.collapseList
                : interpolate(
                    remaining > 1
                      ? dictionary.content.seeMoreMany
                      : dictionary.content.seeMoreOne,
                    { count: remaining },
                  )}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

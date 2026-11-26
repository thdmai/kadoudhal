"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { kindLabel as formatKindLabel } from "@/lib/content-kind";
import { interpolate } from "@/lib/i18n/dictionaries";
import { useDictionary } from "@/lib/i18n/provider";

type SessionRowProps = {
  title: string;
  kind: string;
  coverUrl: string | null;
  audioUrl: string | null;
};

export function SessionRow({
  title,
  kind,
  coverUrl,
  audioUrl,
}: SessionRowProps) {
  const [lightbox, setLightbox] = useState(false);
  const [inView, setInView] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const dictionary = useDictionary();
  const kindLabel = formatKindLabel(kind, dictionary.content.kind);
  const cardRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  const lightboxNode =
    lightbox && coverUrl && mounted
      ? createPortal(
          <div
            className="session-lightbox"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setLightbox(false);
            }}
          >
            <div className="session-lightbox-panel">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p id={titleId} className="truncate text-sm text-white/90">
                  {kindLabel} — {title}
                </p>
                <button
                  type="button"
                  className="rounded-md border border-white/25 px-3 py-1.5 text-sm text-white hover:border-gold hover:text-gold"
                  onClick={() => setLightbox(false)}
                >
                  {dictionary.content.close}
                </button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverUrl}
                alt={title}
                className="max-h-[85vh] w-full object-contain"
              />
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <li
      ref={cardRef}
      className={`session-card ${inView ? "session-card-in" : ""}`}
    >
      <h3 className="mb-1 text-sm font-semibold leading-tight text-gold sm:text-base">
        {kindLabel}
        <span className="text-white/45"> — </span>
        <span className="text-white">{title}</span>
      </h3>

      <div className="flex h-11 items-center">
        {coverUrl ? (
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="relative z-10 size-11 shrink-0 overflow-hidden rounded-full border-2 border-gold/70 bg-[#1a1a1a] p-0 outline-none transition hover:border-gold focus-visible:ring-2 focus-visible:ring-gold/50"
            aria-label={interpolate(dictionary.content.enlarge, { title })}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt=""
              height={0}
              className="size-full object-cover"
            />
          </button>
        ) : (
          <div
            className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-white/25 text-[0.65rem] text-white/40"
            aria-hidden
          >
            img
          </div>
        )}

        <div className="-ms-10 flex h-10 min-w-0 flex-1 items-center overflow-hidden rounded-full border border-gold/30 bg-[#0e0e0e] ps-6">
          {audioUrl ? (
            <audio
              controls
              preload="none"
              className="h-full w-full"
              src={audioUrl}
            >
              {dictionary.content.audioUnsupported}
            </audio>
          ) : (
            <p className="px-3 text-sm text-white/55">
              {dictionary.content.audioUnavailable}
            </p>
          )}
        </div>
      </div>

      {lightboxNode}
    </li>
  );
}

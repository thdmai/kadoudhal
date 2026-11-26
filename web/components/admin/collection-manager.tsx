"use client";

import { useActionState, useEffect, useId, useMemo, useState } from "react";
import {
  createSessionAction,
  softDeleteSectionAction,
  softDeleteTrackAction,
} from "@/app/admin/contenu/actions";
import { FileDropZone } from "@/components/admin/file-drop-zone";
import { useActionToast } from "@/components/toast";
import type { AdminSection } from "@/lib/admin/load-collection";
import { kindLabel, normalizeKind } from "@/lib/content-kind";
import type { ContentCollection } from "@/lib/home";
import { interpolate } from "@/lib/i18n/dictionaries";
import { useDictionary } from "@/lib/i18n/provider";

type CollectionManagerProps = {
  collection: ContentCollection;
  unit: string;
  sections: AdminSection[];
  maxAudioBytes: number;
  maxCoverBytes: number;
  coranKinds: string[];
};

type ModalSeed = {
  number: string;
  title: string;
  titleAr: string;
};

export function CollectionManager({
  collection,
  unit,
  sections,
  maxAudioBytes,
  maxCoverBytes,
  coranKinds,
}: CollectionManagerProps) {
  const dictionary = useDictionary();
  const t = dictionary.admin.collection;
  const common = dictionary.admin.common;
  const unitLower = unit.toLowerCase();

  const activeSections = useMemo(
    () => sections.filter((s) => !s.deleted_at),
    [sections],
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [seed, setSeed] = useState<ModalSeed>({
    number: "",
    title: "",
    titleAr: "",
  });
  const [formKey, setFormKey] = useState(0);

  const [createState, createAction, createPending] = useActionState(
    createSessionAction,
    null,
  );
  const [deleteSectionState, deleteSectionAction, deleteSectionPending] =
    useActionState(softDeleteSectionAction, null);
  const [deleteTrackState, deleteTrackAction, deleteTrackPending] =
    useActionState(softDeleteTrackAction, null);

  useActionToast(createState);
  useActionToast(deleteSectionState);
  useActionToast(deleteTrackState);

  useEffect(() => {
    if (!createState?.ok) return;
    setModalOpen(false);
    setFormKey((k) => k + 1);
  }, [createState]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !createPending) setModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, createPending]);

  function openModal(next?: Partial<ModalSeed>) {
    setSeed({
      number: next?.number ?? "",
      title: next?.title ?? "",
      titleAr: next?.titleAr ?? "",
    });
    setFormKey((k) => k + 1);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--admin-muted)]">
          {interpolate(t.intro, { unit: unitLower })}
        </p>
        <button
          type="button"
          className="admin-btn"
          onClick={() => openModal()}
        >
          {t.newSession}
        </button>
      </div>

      <div className="space-y-4">
        {sections.map((section) => {
          const active = !section.deleted_at;
          const visibleTracks = section.tracks.filter((tr) => !tr.deleted_at);
          const removedTracks = section.tracks.filter((tr) => tr.deleted_at);

          return (
            <div key={section.id} className="admin-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--admin-border)] bg-[var(--admin-soft)] px-3 py-2">
                <div>
                  <p className="text-sm font-semibold">
                    {interpolate(t.sectionNumber, {
                      number: section.number,
                      title: section.title,
                    })}
                  </p>
                  {section.title_ar ? (
                    <p className="font-arabic text-xs text-[var(--admin-muted)]">
                      {section.title_ar}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {active ? (
                    <span className="admin-badge admin-badge-admin">
                      {common.active}
                    </span>
                  ) : (
                    <span className="admin-badge admin-badge-off">
                      {common.removed}
                    </span>
                  )}
                  {active ? (
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost !px-2.5 !py-1.5 text-xs"
                      onClick={() =>
                        openModal({
                          number: String(section.number),
                          title: section.title,
                          titleAr: section.title_ar,
                        })
                      }
                    >
                      {t.addSession}
                    </button>
                  ) : null}
                  <form action={deleteSectionAction}>
                    <input type="hidden" name="id" value={section.id} />
                    <input
                      type="hidden"
                      name="collection"
                      value={collection}
                    />
                    <input
                      type="hidden"
                      name="restore"
                      value={active ? "0" : "1"}
                    />
                    <button
                      type="submit"
                      disabled={deleteSectionPending}
                      className={
                        active
                          ? "admin-btn admin-btn-danger !px-2.5 !py-1.5 text-xs"
                          : "admin-btn admin-btn-ghost !px-2.5 !py-1.5 text-xs"
                      }
                    >
                      {active ? common.remove : common.restore}
                    </button>
                  </form>
                </div>
              </div>

              <div className="divide-y divide-[var(--admin-border)]">
                {visibleTracks.length === 0 && removedTracks.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-[var(--admin-muted)]">
                    {interpolate(t.emptySection, { unit: unitLower })}
                  </p>
                ) : null}

                {[...visibleTracks, ...removedTracks].map((track) => {
                  const trackActive = !track.deleted_at;
                  return (
                    <div
                      key={track.id}
                      className="admin-row flex flex-wrap items-center gap-2.5 px-3 py-1.5"
                    >
                      {track.cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={track.cover_url}
                          alt=""
                          className="h-9 w-8 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-8 items-center justify-center rounded bg-[var(--admin-soft)] text-[0.6rem] text-[var(--admin-muted)]">
                          —
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-snug">
                          {kindLabel(track.kind, dictionary.content.kind)} —{" "}
                          {track.title}
                        </p>
                        <p className="text-[0.7rem] leading-snug text-[var(--admin-muted)]">
                          {track.published
                            ? common.publishedOnSite
                            : common.draft}
                          {!trackActive ? common.removedSuffix : ""}
                        </p>
                      </div>
                      <form action={deleteTrackAction}>
                        <input type="hidden" name="id" value={track.id} />
                        <input
                          type="hidden"
                          name="collection"
                          value={collection}
                        />
                        <input
                          type="hidden"
                          name="restore"
                          value={trackActive ? "0" : "1"}
                        />
                        <button
                          type="submit"
                          disabled={deleteTrackPending}
                          className={
                            trackActive
                              ? "admin-btn admin-btn-danger !px-2.5 !py-1.5 text-xs"
                              : "admin-btn admin-btn-ghost !px-2.5 !py-1.5 text-xs"
                          }
                        >
                          {trackActive ? common.remove : common.restore}
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {sections.length === 0 ? (
          <div className="admin-card px-4 py-10 text-center text-sm text-[var(--admin-muted)]">
            {interpolate(t.emptyCollection, { unit: unitLower })}{" "}
            <button
              type="button"
              className="font-semibold text-[var(--admin-accent)] underline-offset-2 hover:underline"
              onClick={() => openModal()}
            >
              {t.firstSession}
            </button>
          </div>
        ) : null}
      </div>

      {modalOpen ? (
        <SessionModal
          key={formKey}
          collection={collection}
          unit={unit}
          sections={activeSections}
          seed={seed}
          action={createAction}
          pending={createPending}
          maxAudioBytes={maxAudioBytes}
          maxCoverBytes={maxCoverBytes}
          coranKinds={coranKinds}
          onClose={() => {
            if (!createPending) setModalOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

type SessionModalProps = {
  collection: ContentCollection;
  unit: string;
  sections: AdminSection[];
  seed: ModalSeed;
  action: (payload: FormData) => void;
  pending: boolean;
  maxAudioBytes: number;
  maxCoverBytes: number;
  coranKinds: string[];
  onClose: () => void;
};

function SessionModal({
  collection,
  unit,
  sections,
  seed,
  action,
  pending,
  maxAudioBytes,
  maxCoverBytes,
  coranKinds,
  onClose,
}: SessionModalProps) {
  const dictionary = useDictionary();
  const t = dictionary.admin.collection;
  const common = dictionary.admin.common;
  const unitLower = unit.toLowerCase();
  const titleId = useId();
  const numberListId = useId();
  const titleListId = useId();
  const kindListId = useId();

  const [number, setNumber] = useState(seed.number);
  const [title, setTitle] = useState(seed.title);
  const [titleAr, setTitleAr] = useState(seed.titleAr);
  const defaultKind = coranKinds[0] || "djouzou";
  const [kind, setKind] = useState(
    collection === "coran"
      ? kindLabel(defaultKind, dictionary.content.kind)
      : "seance",
  );
  const [coverPreview, setCoverPreview] = useState("");

  const kindOptions = useMemo(() => {
    const fromTracks = sections.flatMap((s) =>
      s.tracks.map((tr) => tr.kind).filter(Boolean),
    );
    const keys = [...coranKinds, ...fromTracks];
    const seen = new Set<string>();
    const options: { value: string; label: string }[] = [];
    for (const key of keys) {
      const slug = normalizeKind(key);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      options.push({
        value: slug,
        label: kindLabel(slug, dictionary.content.kind),
      });
    }
    return options;
  }, [sections, coranKinds, dictionary.content.kind]);

  function applySectionByNumber(value: string) {
    setNumber(value);
    const n = Number(value);
    if (!Number.isFinite(n)) return;
    const match = sections.find((s) => s.number === n);
    if (match) {
      setTitle(match.title);
      setTitleAr(match.title_ar);
    }
  }

  function applySectionByTitle(value: string) {
    setTitle(value);
    const match = sections.find(
      (s) => s.title.toLowerCase() === value.trim().toLowerCase(),
    );
    if (match) {
      setNumber(String(match.number));
      setTitleAr(match.title_ar);
    }
  }

  const kindSlug = normalizeKind(kind) || kind;
  const kindDisplay = kindLabel(kindSlug, dictionary.content.kind);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="admin-card max-h-[92vh] w-full max-w-2xl overflow-y-auto p-5 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              id={titleId}
              className="font-display text-xl text-[var(--admin-ink)]"
            >
              {t.modalTitle}
            </h2>
            <p className="mt-1 text-sm text-[var(--admin-muted)]">
              {interpolate(t.modalLead, { unit: unitLower })}
            </p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-ghost px-3 py-1.5 text-sm"
            onClick={onClose}
            disabled={pending}
          >
            {common.close}
          </button>
        </div>

        <form action={action} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="collection" value={collection} />

          <label className="space-y-1.5">
            <span className="text-sm text-[var(--admin-muted)]">
              {interpolate(t.numberLabel, { unit: unitLower })}
            </span>
            <input
              className="admin-field"
              name="number"
              type="number"
              min={1}
              list={numberListId}
              value={number}
              onChange={(e) => applySectionByNumber(e.target.value)}
              placeholder={t.numberPlaceholder}
              required
              autoFocus
            />
            <datalist id={numberListId}>
              {sections.map((s) => (
                <option key={s.id} value={s.number}>
                  {s.title}
                </option>
              ))}
            </datalist>
          </label>

          <label className="space-y-1.5">
            <span className="text-sm text-[var(--admin-muted)]">
              {interpolate(t.titleLabel, { unit: unitLower })}
            </span>
            <input
              className="admin-field"
              name="title"
              list={titleListId}
              value={title}
              onChange={(e) => applySectionByTitle(e.target.value)}
              placeholder={t.titlePlaceholder}
              required
            />
            <datalist id={titleListId}>
              {sections.map((s) => (
                <option key={s.id} value={s.title}>
                  N° {s.number}
                </option>
              ))}
            </datalist>
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-sm text-[var(--admin-muted)]">{t.titleAr}</span>
            <input
              className="admin-field font-arabic"
              name="title_ar"
              dir="rtl"
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              placeholder={common.optional}
            />
          </label>

          {collection === "coran" ? (
            <label className="space-y-1.5">
              <span className="text-sm text-[var(--admin-muted)]">
                {t.kindLabel}
              </span>
              <input
                className="admin-field"
                name="kind"
                list={kindListId}
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                placeholder={t.kindPlaceholder}
                required
              />
              <datalist id={kindListId}>
                {kindOptions.map((opt) => (
                  <option key={opt.value} value={opt.label} />
                ))}
              </datalist>
            </label>
          ) : (
            <input type="hidden" name="kind" value="seance" />
          )}

          <label
            className={`space-y-1.5 ${collection === "coran" ? "" : "sm:col-span-2"}`}
          >
            <span className="text-sm text-[var(--admin-muted)]">
              {collection === "coran"
                ? interpolate(t.sessionTitleKind, {
                    kind: kindDisplay.toLowerCase(),
                  })
                : t.sessionTitle}
            </span>
            <input
              className="admin-field"
              name="session_title"
              placeholder={
                collection === "coran"
                  ? interpolate(t.sessionPlaceholderKind, {
                      kind: kindDisplay,
                    })
                  : t.sessionPlaceholder
              }
              required
            />
          </label>

          <div className="sm:col-span-2">
            <FileDropZone
              name="audio"
              kind="audio"
              accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.webm"
              maxBytes={maxAudioBytes}
              required
              label={t.audioFile}
            />
          </div>

          <div className="sm:col-span-2">
            <FileDropZone
              name="cover"
              kind="image"
              accept="image/jpeg,image/png,image/webp,image/gif"
              maxBytes={maxCoverBytes}
              required
              label={t.coverImage}
              onFile={(file) => {
                setCoverPreview(file ? URL.createObjectURL(file) : "");
              }}
              preview={
                coverPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverPreview}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-[0.65rem] text-[var(--admin-muted)]">
                    {common.preview}
                  </span>
                )
              }
            />
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-2 sm:col-span-2">
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              onClick={onClose}
              disabled={pending}
            >
              {common.cancel}
            </button>
            <button type="submit" className="admin-btn" disabled={pending}>
              {pending ? t.publishing : t.addSessionSubmit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

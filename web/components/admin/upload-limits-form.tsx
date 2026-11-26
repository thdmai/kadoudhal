"use client";

import { useActionState } from "react";
import { updateSiteSettingsAction } from "@/app/admin/reglages/actions";
import { useActionToast } from "@/components/toast";
import { interpolate } from "@/lib/i18n/dictionaries";
import { useDictionary } from "@/lib/i18n/provider";

type SiteSettingsFormProps = {
  maxAudioMb: number;
  maxCoverMb: number;
  maxHomeImageMb: number;
  coranKinds: string;
  publishByDefault: boolean;
  absoluteMaxAudioMb: number;
  absoluteMaxCoverMb: number;
  absoluteMaxHomeImageMb: number;
};

export function UploadLimitsForm({
  maxAudioMb,
  maxCoverMb,
  maxHomeImageMb,
  coranKinds,
  publishByDefault,
  absoluteMaxAudioMb,
  absoluteMaxCoverMb,
  absoluteMaxHomeImageMb,
}: SiteSettingsFormProps) {
  const [state, action, pending] = useActionState(
    updateSiteSettingsAction,
    null,
  );
  useActionToast(state);
  const dictionary = useDictionary();
  const t = dictionary.admin.settings;
  const common = dictionary.admin.common;

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="admin-card space-y-4 p-5">
          <div>
            <h2 className="font-display text-xl text-[var(--admin-ink)]">
              {t.fileSizes}
            </h2>
            <p className="mt-1 text-sm text-[var(--admin-muted)]">
              {t.fileSizesHint}
            </p>
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm text-[var(--admin-muted)]">
              {interpolate(t.audioMb, { max: absoluteMaxAudioMb })}
            </span>
            <input
              className="admin-field"
              type="number"
              name="max_audio_mb"
              min={1}
              max={absoluteMaxAudioMb}
              defaultValue={maxAudioMb}
              required
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm text-[var(--admin-muted)]">
              {interpolate(t.coverMb, { max: absoluteMaxCoverMb })}
            </span>
            <input
              className="admin-field"
              type="number"
              name="max_cover_mb"
              min={1}
              max={absoluteMaxCoverMb}
              defaultValue={maxCoverMb}
              required
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm text-[var(--admin-muted)]">
              {interpolate(t.homeImageMb, { max: absoluteMaxHomeImageMb })}
            </span>
            <input
              className="admin-field"
              type="number"
              name="max_home_image_mb"
              min={1}
              max={absoluteMaxHomeImageMb}
              defaultValue={maxHomeImageMb}
              required
            />
          </label>
        </section>

        <section className="admin-card space-y-4 p-5">
          <div>
            <h2 className="font-display text-xl text-[var(--admin-ink)]">
              {t.content}
            </h2>
            <p className="mt-1 text-sm text-[var(--admin-muted)]">
              {t.contentHint}
            </p>
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm text-[var(--admin-muted)]">
              {t.coranKinds}
            </span>
            <input
              className="admin-field"
              name="coran_kinds"
              defaultValue={coranKinds}
              placeholder="djouzou,soumin,hizb"
              required
            />
            <span className="text-xs text-[var(--admin-muted)]">
              {t.coranKindsHint}
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-md border border-[var(--admin-border)] bg-[var(--admin-soft)] px-3 py-3 text-sm text-[var(--admin-ink)]">
            <input
              type="checkbox"
              name="publish_by_default"
              value="1"
              defaultChecked={publishByDefault}
              className="mt-0.5 size-4 shrink-0 accent-[var(--admin-accent)]"
            />
            <span>{t.publishByDefault}</span>
          </label>
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--admin-muted)]">
          {interpolate(t.footerNote, { max: absoluteMaxAudioMb })}
        </p>
        <button type="submit" className="admin-btn" disabled={pending}>
          {pending ? common.saving : common.save}
        </button>
      </div>
    </form>
  );
}

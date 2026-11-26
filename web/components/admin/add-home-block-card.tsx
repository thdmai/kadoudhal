"use client";

import { useActionState, useEffect, useState } from "react";
import { createHomeBlockAction } from "@/app/admin/accueil/actions";
import { HomeBlockImageField } from "@/components/admin/home-block-image-field";
import { useActionToast } from "@/components/toast";
import { useDictionary } from "@/lib/i18n/provider";

export function AddHomeBlockCard({ maxImageBytes }: { maxImageBytes: number }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createHomeBlockAction, null);
  useActionToast(state);
  const dictionary = useDictionary();
  const t = dictionary.admin.home;
  const common = dictionary.admin.common;

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="admin-card flex min-h-64 flex-col items-center justify-center gap-2 border-dashed p-4 text-[var(--admin-muted)] transition-colors hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)]"
      >
        <span className="flex size-12 items-center justify-center rounded-full border border-current text-2xl leading-none">
          +
        </span>
        <span className="text-sm font-semibold">{t.addTitle}</span>
        <span className="max-w-[12rem] text-center text-xs">{t.addHint}</span>
      </button>
    );
  }

  return (
    <form
      action={action}
      className="admin-card flex h-full flex-col space-y-3 border-[var(--admin-accent)] p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-lg text-[var(--admin-ink)]">
          {t.newBlock}
        </h2>
        <button
          type="button"
          className="text-xs text-[var(--admin-muted)] hover:text-[var(--admin-ink)]"
          onClick={() => setOpen(false)}
        >
          {common.cancel}
        </button>
      </div>

      <label className="block space-y-1">
        <span className="text-xs text-[var(--admin-muted)]">{t.slug}</span>
        <input
          className="admin-field py-1.5 text-sm"
          name="slug"
          placeholder="sunna"
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-[var(--admin-muted)]">{t.titleLabel}</span>
        <input className="admin-field py-1.5 text-sm" name="title" required />
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-[var(--admin-muted)]">{t.titleAr}</span>
        <input
          className="admin-field py-1.5 font-arabic text-sm"
          name="title_ar"
          dir="rtl"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-[var(--admin-muted)]">{t.text}</span>
        <textarea
          className="admin-field min-h-16 py-1.5 text-sm"
          name="excerpt"
          required
        />
      </label>

      <HomeBlockImageField
        defaultUrl=""
        maxBytes={maxImageBytes}
        required
      />

      <button
        type="submit"
        className="admin-btn mt-auto w-full py-2 text-sm"
        disabled={pending}
      >
        {pending ? common.creating : t.createBlock}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import {
  deleteHomeBlockAction,
  updateHomeBlockAction,
} from "@/app/admin/accueil/actions";
import { HomeBlockImageField } from "@/components/admin/home-block-image-field";
import { useActionToast } from "@/components/toast";
import { interpolate } from "@/lib/i18n/dictionaries";
import { useDictionary } from "@/lib/i18n/provider";

type HomeBlockFormProps = {
  block: {
    id: string;
    slug: string;
    title: string;
    title_ar: string;
    excerpt: string;
    image_url: string;
  };
  maxImageBytes: number;
};

export function HomeBlockForm({ block, maxImageBytes }: HomeBlockFormProps) {
  const [state, action, pending] = useActionState(updateHomeBlockAction, null);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteHomeBlockAction,
    null,
  );
  useActionToast(state);
  useActionToast(deleteState);
  const dictionary = useDictionary();
  const t = dictionary.admin.home;
  const common = dictionary.admin.common;

  const busy = pending || deletePending;

  return (
    <form
      action={action}
      className="admin-card flex h-full flex-col space-y-3 p-4"
    >
      <input type="hidden" name="id" value={block.id} />
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-lg text-[var(--admin-ink)]">
          {block.slug}
        </h2>
        <span className="font-arabic text-base text-[var(--admin-accent)]">
          {block.title_ar || "—"}
        </span>
      </div>

      <label className="block space-y-1">
        <span className="text-xs text-[var(--admin-muted)]">{t.titleLabel}</span>
        <input
          className="admin-field py-1.5 text-sm"
          name="title"
          defaultValue={block.title}
          required
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-[var(--admin-muted)]">{t.titleAr}</span>
        <input
          className="admin-field py-1.5 font-arabic text-sm"
          name="title_ar"
          defaultValue={block.title_ar}
          dir="rtl"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-[var(--admin-muted)]">{t.text}</span>
        <textarea
          className="admin-field min-h-16 py-1.5 text-sm"
          name="excerpt"
          defaultValue={block.excerpt}
          required
        />
      </label>

      <HomeBlockImageField
        defaultUrl={block.image_url}
        maxBytes={maxImageBytes}
      />

      <div className="mt-auto flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          className="admin-btn inline-flex h-12 min-w-12 items-center justify-center gap-2 px-4"
          disabled={busy}
          title={common.save}
          aria-label={pending ? common.saving : common.save}
        >
          {pending ? (
            <span className="text-base">…</span>
          ) : (
            <i className="text-xl not-italic" aria-hidden>
              💾
            </i>
          )}
        </button>
        <button
          type="submit"
          formAction={deleteAction}
          className="admin-btn admin-btn-danger inline-flex h-12 min-w-12 items-center justify-center gap-2 px-4"
          disabled={busy}
          title={common.delete}
          aria-label={deletePending ? common.deleting : common.delete}
          onClick={(e) => {
            if (
              !confirm(
                interpolate(t.deleteConfirm, { slug: block.slug }),
              )
            ) {
              e.preventDefault();
            }
          }}
        >
          {deletePending ? (
            <span className="text-base">…</span>
          ) : (
            <i className="text-xl not-italic" aria-hidden>
              🗑
            </i>
          )}
        </button>
      </div>
    </form>
  );
}

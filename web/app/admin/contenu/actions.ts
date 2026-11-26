"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  uploadTrackAudio,
  uploadTrackCover,
} from "@/lib/admin/content-media";
import { getSiteSettings } from "@/lib/admin/settings";
import { type ContentCollection } from "@/lib/home";
import { requireAdmin } from "@/lib/auth/admin";
import { normalizeKind } from "@/lib/content-kind";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { createClient } from "@/lib/supabase/server";

export type ContentActionState = {
  ok: boolean;
  message: string;
} | null;

const collections = ["coran", "hadith", "fiqh"] as const;

function isCollection(value: string): value is ContentCollection {
  return (collections as readonly string[]).includes(value);
}

function revalidateCollection(collection: ContentCollection) {
  revalidatePath(`/admin/${collection}`);
  revalidatePath(`/${collection}`);
  revalidatePath("/admin");
}

async function contentCopy() {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  return {
    locale,
    dictionary,
    toasts: dictionary.admin.collection.toasts,
    common: dictionary.admin.common,
  };
}

const sessionSchema = z.object({
  collection: z.enum(collections),
  number: z.coerce.number().int().positive().max(9999),
  title: z.string().trim().min(1).max(120),
  title_ar: z.string().trim().max(120),
  kind: z.string().trim().min(1).max(40),
  session_title: z.string().trim().min(1).max(160),
});

export async function createSessionAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  await requireAdmin();
  const { dictionary, toasts, common } = await contentCopy();

  const parsed = sessionSchema.safeParse({
    collection: formData.get("collection"),
    number: formData.get("number"),
    title: formData.get("title"),
    title_ar: formData.get("title_ar"),
    kind: formData.get("kind"),
    session_title: formData.get("session_title"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || common.invalidFields,
    };
  }

  const { collection, number, title, title_ar, session_title } = parsed.data;

  const kind =
    collection === "coran" ? normalizeKind(parsed.data.kind) : "seance";

  if (!kind) {
    return { ok: false, message: toasts.invalidKind };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("sections")
    .select("id, title, title_ar, deleted_at")
    .eq("collection", collection)
    .eq("number", number)
    .maybeSingle();

  let sectionId = existing?.id as string | undefined;

  if (existing?.deleted_at) {
    const { error: restoreError } = await supabase
      .from("sections")
      .update({
        deleted_at: null,
        title,
        title_ar,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (restoreError) {
      return { ok: false, message: toasts.reactivateFailed };
    }
  } else if (!existing) {
    const { data: created, error: createError } = await supabase
      .from("sections")
      .insert({
        collection,
        number,
        title,
        title_ar,
        sort_order: number,
      })
      .select("id")
      .single();

    if (createError || !created) {
      if (createError?.code === "23505") {
        return {
          ok: false,
          message: interpolate(toasts.numberExists, { number }),
        };
      }
      return { ok: false, message: toasts.createSectionFailed };
    }
    sectionId = created.id;
  } else {
    if (
      (title && title !== existing.title) ||
      (title_ar && title_ar !== existing.title_ar)
    ) {
      await supabase
        .from("sections")
        .update({
          title: title || existing.title,
          title_ar: title_ar || existing.title_ar,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    }
  }

  if (!sectionId) {
    return { ok: false, message: toasts.sectionNotFound };
  }

  const cover = await uploadTrackCover(supabase, formData);
  if ("error" in cover) {
    return { ok: false, message: cover.error };
  }

  const audio = await uploadTrackAudio(supabase, formData, collection);
  if ("error" in audio) {
    return { ok: false, message: audio.error };
  }

  const { count } = await supabase
    .from("tracks")
    .select("id", { count: "exact", head: true })
    .eq("section_id", sectionId)
    .is("deleted_at", null);

  const settings = await getSiteSettings();

  const { error: trackError } = await supabase.from("tracks").insert({
    section_id: sectionId,
    title: session_title,
    body_text: kind,
    cover_url: cover.url,
    audio_path: audio.path,
    published: settings.publishByDefault,
    sort_order: (count ?? 0) + 1,
  });

  if (trackError) {
    return { ok: false, message: toasts.saveSessionFailed };
  }

  revalidateCollection(collection);
  const unit = dictionary.collections[collection].unit;
  return {
    ok: true,
    message: interpolate(toasts.sessionAdded, {
      unit: unit.toLowerCase(),
      number,
    }),
  };
}

export async function softDeleteSectionAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  await requireAdmin();
  const { toasts, common } = await contentCopy();

  const id = String(formData.get("id") || "");
  const collection = String(formData.get("collection") || "");
  const restore = String(formData.get("restore") || "") === "1";

  if (!id || !isCollection(collection)) {
    return { ok: false, message: common.invalidData };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("sections")
    .update({
      deleted_at: restore ? null : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { ok: false, message: toasts.sectionUpdateFailed };
  }

  revalidateCollection(collection);
  return {
    ok: true,
    message: restore ? toasts.sectionRestored : toasts.sectionRemoved,
  };
}

export async function softDeleteTrackAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  await requireAdmin();
  const { toasts, common } = await contentCopy();

  const id = String(formData.get("id") || "");
  const collection = String(formData.get("collection") || "");
  const restore = String(formData.get("restore") || "") === "1";

  if (!id || !isCollection(collection)) {
    return { ok: false, message: common.invalidData };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tracks")
    .update({
      deleted_at: restore ? null : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { ok: false, message: toasts.trackUpdateFailed };
  }

  revalidateCollection(collection);
  return {
    ok: true,
    message: restore ? toasts.trackRestored : toasts.trackRemoved,
  };
}

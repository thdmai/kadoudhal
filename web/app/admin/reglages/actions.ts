"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseCoranKinds } from "@/lib/admin/settings";
import {
  ABSOLUTE_MAX_AUDIO_MB,
  ABSOLUTE_MAX_COVER_MB,
  ABSOLUTE_MAX_HOME_IMAGE_MB,
} from "@/lib/admin/upload-limits";
import { requireAdmin } from "@/lib/auth/admin";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { createClient } from "@/lib/supabase/server";

export type SettingsActionState = {
  ok: boolean;
  message: string;
} | null;

const schema = z.object({
  max_audio_mb: z.coerce.number().int().min(1).max(ABSOLUTE_MAX_AUDIO_MB),
  max_cover_mb: z.coerce.number().int().min(1).max(ABSOLUTE_MAX_COVER_MB),
  max_home_image_mb: z.coerce
    .number()
    .int()
    .min(1)
    .max(ABSOLUTE_MAX_HOME_IMAGE_MB),
  coran_kinds: z.string().trim().min(1).max(200),
  publish_by_default: z.enum(["0", "1"]),
});

export async function updateSiteSettingsAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await requireAdmin();
  const locale = await getLocale();
  const toasts = getDictionary(locale).admin.settings.toasts;

  const parsed = schema.safeParse({
    max_audio_mb: formData.get("max_audio_mb"),
    max_cover_mb: formData.get("max_cover_mb"),
    max_home_image_mb: formData.get("max_home_image_mb"),
    coran_kinds: formData.get("coran_kinds"),
    publish_by_default: formData.get("publish_by_default") === "1" ? "1" : "0",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || toasts.invalid,
    };
  }

  const kinds = parseCoranKinds(parsed.data.coran_kinds);
  if (!kinds.length) {
    return { ok: false, message: toasts.needKind };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const rows = [
    {
      key: "max_audio_mb",
      value: String(parsed.data.max_audio_mb),
      updated_at: now,
    },
    {
      key: "max_cover_mb",
      value: String(parsed.data.max_cover_mb),
      updated_at: now,
    },
    {
      key: "max_home_image_mb",
      value: String(parsed.data.max_home_image_mb),
      updated_at: now,
    },
    {
      key: "coran_kinds",
      value: kinds.join(","),
      updated_at: now,
    },
    {
      key: "publish_by_default",
      value: parsed.data.publish_by_default,
      updated_at: now,
    },
  ];

  const { error } = await supabase.from("site_settings").upsert(rows);

  if (error) {
    return { ok: false, message: toasts.saveFailed };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/reglages");
  revalidatePath("/admin/accueil");
  revalidatePath("/admin/coran");
  revalidatePath("/admin/hadith");
  revalidatePath("/admin/fiqh");
  return { ok: true, message: toasts.saved };
}

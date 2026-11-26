import type { SupabaseClient } from "@supabase/supabase-js";
import { imageMime, sniffImage } from "@/lib/admin/file-sniff";
import { getSiteSettings } from "@/lib/admin/settings";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export async function resolveHomeImageUrl(
  supabase: SupabaseClient,
  formData: FormData,
  fallback = "",
): Promise<{ url: string } | { error: string }> {
  const locale = await getLocale();
  const media = getDictionary(locale).admin.media;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const settings = await getSiteSettings();
    if (file.size > settings.maxHomeImageBytes) {
      return {
        error: interpolate(media.imageTooHeavy, {
          maxMb: settings.maxHomeImageMb,
        }),
      };
    }

    const kind = await sniffImage(file);
    if (!kind) {
      return { error: media.invalidImage };
    }

    const contentType = imageMime(kind);
    const path = `${crypto.randomUUID()}.${kind === "jpeg" ? "jpg" : kind}`;

    const { error } = await supabase.storage
      .from("home-images")
      .upload(path, file, {
        contentType,
        upsert: false,
      });

    if (error) {
      return { error: media.homeUploadFailed };
    }

    const { data } = supabase.storage.from("home-images").getPublicUrl(path);
    return { url: data.publicUrl };
  }

  const typed = String(formData.get("image_url") ?? "").trim();
  if (typed) return { url: typed };
  if (fallback) return { url: fallback };
  return { error: media.needImage };
}

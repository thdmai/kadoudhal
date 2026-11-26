import type { SupabaseClient } from "@supabase/supabase-js";
import {
  audioMime,
  imageMime,
  sniffAudio,
  sniffImage,
} from "@/lib/admin/file-sniff";
import { getSiteSettings } from "@/lib/admin/settings";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export async function uploadTrackCover(
  supabase: SupabaseClient,
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  const locale = await getLocale();
  const media = getDictionary(locale).admin.media;
  const file = formData.get("cover");
  if (!(file instanceof File) || file.size === 0) {
    return { error: media.needCover };
  }

  const settings = await getSiteSettings();
  if (file.size > settings.maxCoverBytes) {
    return {
      error: interpolate(media.imageTooHeavy, { maxMb: settings.maxCoverMb }),
    };
  }

  const kind = await sniffImage(file);
  if (!kind) {
    return { error: media.invalidImage };
  }

  const contentType = imageMime(kind);
  const path = `tracks/${crypto.randomUUID()}.${kind === "jpeg" ? "jpg" : kind}`;
  const { error } = await supabase.storage.from("home-images").upload(path, file, {
    contentType,
    upsert: false,
  });

  if (error) {
    return { error: media.coverUploadFailed };
  }

  const { data } = supabase.storage.from("home-images").getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function uploadTrackAudio(
  supabase: SupabaseClient,
  formData: FormData,
  collection: string,
): Promise<{ path: string } | { error: string }> {
  const locale = await getLocale();
  const media = getDictionary(locale).admin.media;
  const file = formData.get("audio");
  if (!(file instanceof File) || file.size === 0) {
    return { error: media.needAudio };
  }

  const settings = await getSiteSettings();
  if (file.size > settings.maxAudioBytes) {
    return {
      error: interpolate(media.audioTooHeavy, { maxMb: settings.maxAudioMb }),
    };
  }

  const kind = await sniffAudio(file);
  if (!kind) {
    return { error: media.invalidAudio };
  }

  const contentType = audioMime(kind);
  const path = `${collection}/${crypto.randomUUID()}.${kind}`;
  const { error } = await supabase.storage.from("audio").upload(path, file, {
    contentType,
    upsert: false,
  });

  if (error) {
    return { error: media.audioUploadFailed };
  }

  return { path };
}

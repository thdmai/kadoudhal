import { createClient } from "@/lib/supabase/server";
import { normalizeKind } from "@/lib/content-kind";
import {
  ABSOLUTE_MAX_AUDIO_MB,
  ABSOLUTE_MAX_COVER_MB,
  ABSOLUTE_MAX_HOME_IMAGE_MB,
  DEFAULT_CORAN_KINDS_SETTING,
  DEFAULT_MAX_AUDIO_MB,
  DEFAULT_MAX_COVER_MB,
  DEFAULT_MAX_HOME_IMAGE_MB,
  DEFAULT_PUBLISH_BY_DEFAULT,
} from "@/lib/admin/upload-limits";

export type SiteSettings = {
  maxAudioMb: number;
  maxCoverMb: number;
  maxHomeImageMb: number;
  maxAudioBytes: number;
  maxCoverBytes: number;
  maxHomeImageBytes: number;
  coranKinds: string[];
  publishByDefault: boolean;
};

function clampInt(
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
) {
  const n = Number.parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function parseCoranKinds(raw: string | undefined): string[] {
  const parts = String(raw ?? DEFAULT_CORAN_KINDS_SETTING)
    .split(/[,;\n]+/)
    .map((p) => normalizeKind(p))
    .filter(Boolean);
  const unique = [...new Set(parts)];
  return unique.length ? unique : ["djouzou", "soumin"];
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", [
        "max_audio_mb",
        "max_cover_mb",
        "max_home_image_mb",
        "coran_kinds",
        "publish_by_default",
      ]);

    const map = new Map((data ?? []).map((r) => [r.key, r.value]));
    const maxAudioMb = clampInt(
      map.get("max_audio_mb"),
      DEFAULT_MAX_AUDIO_MB,
      1,
      ABSOLUTE_MAX_AUDIO_MB,
    );
    const maxCoverMb = clampInt(
      map.get("max_cover_mb"),
      DEFAULT_MAX_COVER_MB,
      1,
      ABSOLUTE_MAX_COVER_MB,
    );
    const maxHomeImageMb = clampInt(
      map.get("max_home_image_mb"),
      DEFAULT_MAX_HOME_IMAGE_MB,
      1,
      ABSOLUTE_MAX_HOME_IMAGE_MB,
    );
    const publishRaw = (map.get("publish_by_default") ?? "true").toLowerCase();
    const publishByDefault =
      publishRaw === "0" || publishRaw === "false" || publishRaw === "off"
        ? false
        : DEFAULT_PUBLISH_BY_DEFAULT;

    return {
      maxAudioMb,
      maxCoverMb,
      maxHomeImageMb,
      maxAudioBytes: maxAudioMb * 1024 * 1024,
      maxCoverBytes: maxCoverMb * 1024 * 1024,
      maxHomeImageBytes: maxHomeImageMb * 1024 * 1024,
      coranKinds: parseCoranKinds(map.get("coran_kinds")),
      publishByDefault,
    };
  } catch {
    return {
      maxAudioMb: DEFAULT_MAX_AUDIO_MB,
      maxCoverMb: DEFAULT_MAX_COVER_MB,
      maxHomeImageMb: DEFAULT_MAX_HOME_IMAGE_MB,
      maxAudioBytes: DEFAULT_MAX_AUDIO_MB * 1024 * 1024,
      maxCoverBytes: DEFAULT_MAX_COVER_MB * 1024 * 1024,
      maxHomeImageBytes: DEFAULT_MAX_HOME_IMAGE_MB * 1024 * 1024,
      coranKinds: parseCoranKinds(DEFAULT_CORAN_KINDS_SETTING),
      publishByDefault: DEFAULT_PUBLISH_BY_DEFAULT,
    };
  }
}

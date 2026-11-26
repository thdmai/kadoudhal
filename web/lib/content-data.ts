import {
  collectionMeta,
  type ContentCollection,
} from "@/lib/home";
import { createClient } from "@/lib/supabase/server";

export type PublicTrack = {
  id: string;
  title: string;
  kind: string;
  coverUrl: string | null;
  audioUrl: string | null;
  sortOrder: number;
};

export type PublicSection = {
  id: string;
  number: number;
  title: string;
  titleAr: string;
  tracks: PublicTrack[];
};

export async function loadPublicCollection(collection: ContentCollection) {
  const supabase = await createClient();
  const meta = collectionMeta[collection];

  const { data: sections } = await supabase
    .from("sections")
    .select("id, number, title, title_ar, sort_order")
    .eq("collection", collection)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("number", { ascending: true });

  const sectionRows = sections ?? [];
  if (sectionRows.length === 0) {
    return { meta, sections: [] as PublicSection[] };
  }

  const ids = sectionRows.map((s) => s.id);
  const { data: tracks } = await supabase
    .from("tracks")
    .select("id, section_id, title, body_text, cover_url, audio_path, sort_order")
    .in("section_id", ids)
    .is("deleted_at", null)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const bySection = new Map<string, PublicTrack[]>();

  for (const track of tracks ?? []) {
    let audioUrl: string | null = null;
    if (track.audio_path) {
      const { data } = await supabase.storage
        .from("audio")
        .createSignedUrl(track.audio_path, 60 * 60);
      audioUrl = data?.signedUrl ?? null;
    }

    const list = bySection.get(track.section_id) ?? [];
    list.push({
      id: track.id,
      title: track.title,
      kind: track.body_text || "",
      coverUrl: track.cover_url,
      audioUrl,
      sortOrder: track.sort_order,
    });
    bySection.set(track.section_id, list);
  }

  const publicSections: PublicSection[] = sectionRows
    .map((section) => ({
      id: section.id,
      number: section.number,
      title: section.title,
      titleAr: section.title_ar,
      tracks: bySection.get(section.id) ?? [],
    }))
    .filter((section) => section.tracks.length > 0);

  return { meta, sections: publicSections };
}

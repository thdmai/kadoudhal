import {
  collectionMeta,
  type ContentCollection,
} from "@/lib/home";
import { createClient } from "@/lib/supabase/server";

export type AdminTrack = {
  id: string;
  title: string;
  kind: string;
  cover_url: string | null;
  published: boolean;
  deleted_at: string | null;
  sort_order: number;
};

export type AdminSection = {
  id: string;
  number: number;
  title: string;
  title_ar: string;
  deleted_at: string | null;
  tracks: AdminTrack[];
};

export async function loadCollectionSections(collection: ContentCollection) {
  const supabase = await createClient();

  const { data: sections } = await supabase
    .from("sections")
    .select("id, number, title, title_ar, deleted_at")
    .eq("collection", collection)
    .order("sort_order", { ascending: true })
    .order("number", { ascending: true });

  const sectionRows = sections ?? [];
  const ids = sectionRows.map((s) => s.id);
  const tracksBySection = new Map<string, AdminTrack[]>();

  if (ids.length > 0) {
    const { data: tracks } = await supabase
      .from("tracks")
      .select(
        "id, section_id, title, body_text, cover_url, published, deleted_at, sort_order",
      )
      .in("section_id", ids)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    for (const track of tracks ?? []) {
      const list = tracksBySection.get(track.section_id) ?? [];
      list.push({
        id: track.id,
        title: track.title,
        kind: track.body_text || "",
        cover_url: track.cover_url,
        published: track.published,
        deleted_at: track.deleted_at,
        sort_order: track.sort_order,
      });
      tracksBySection.set(track.section_id, list);
    }
  }

  const adminSections: AdminSection[] = sectionRows.map((section) => ({
    ...section,
    tracks: tracksBySection.get(section.id) ?? [],
  }));

  return {
    meta: collectionMeta[collection],
    sections: adminSections,
  };
}

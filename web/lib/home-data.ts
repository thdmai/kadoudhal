import { homeBlocks, type HomeBlock } from "@/lib/home";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { withTimeout } from "@/lib/with-timeout";

function mapRows(
  data: {
    slug: string;
    title: string;
    title_ar?: string;
    titleAr?: string;
    excerpt: string;
    image_url?: string;
    image?: string;
  }[],
): HomeBlock[] {
  return data.map((row) => {
    const fallback = homeBlocks.find((b) => b.slug === row.slug);
    return {
      slug: row.slug,
      title: row.title,
      titleAr: row.title_ar ?? row.titleAr ?? "",
      excerpt: row.excerpt,
      image:
        row.image_url || row.image || fallback?.image || "/images/coran.jpg",
      imageAlt: fallback?.imageAlt || row.title,
    };
  });
}

/** API Spring si API_URL, sinon Supabase, sinon fallback local. */
export async function getHomeBlocks(): Promise<HomeBlock[]> {
  const api = process.env.API_URL?.replace(/\/$/, "");
  if (api) {
    try {
      const res = await withTimeout(
        fetch(`${api}/api/home-blocks`, {
          next: { revalidate: 60 },
          signal: AbortSignal.timeout(2500),
        }),
        3000,
        null,
      );
      if (res?.ok) {
        const data = (await res.json()) as Parameters<typeof mapRows>[0];
        if (data?.length) return mapRows(data);
      }
    } catch {
      /* fallback */
    }
  }

  if (!getSupabaseEnv()) return homeBlocks;

  try {
    const supabase = await createClient();
    const result = await withTimeout(
      supabase
        .from("home_blocks")
        .select("slug, title, title_ar, excerpt, image_url")
        .is("deleted_at", null)
        .order("sort_order", { ascending: true }),
      4000,
      null,
    );

    if (!result?.data?.length) return homeBlocks;
    return mapRows(result.data);
  } catch {
    return homeBlocks;
  }
}

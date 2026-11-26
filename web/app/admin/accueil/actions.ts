"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { resolveHomeImageUrl } from "@/lib/admin/home-image";
import { requireAdmin } from "@/lib/auth/admin";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { createClient } from "@/lib/supabase/server";

export type HomeBlockActionState = {
  ok: boolean;
  message: string;
} | null;

async function homeToasts() {
  const locale = await getLocale();
  return getDictionary(locale).admin.home.toasts;
}

function revalidateHome() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/accueil");
}

export async function updateHomeBlockAction(
  _prev: HomeBlockActionState,
  formData: FormData,
): Promise<HomeBlockActionState> {
  await requireAdmin();
  const toasts = await homeToasts();
  const common = getDictionary(await getLocale()).admin.common;

  const updateSchema = z.object({
    id: z.string().uuid(),
    title: z.string().trim().min(1, toasts.titleRequired).max(80),
    title_ar: z.string().trim().max(80),
    excerpt: z.string().trim().min(1, toasts.textRequired).max(500),
  });

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    title_ar: formData.get("title_ar"),
    excerpt: formData.get("excerpt"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || common.invalidFields,
    };
  }

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("home_blocks")
    .select("image_url")
    .eq("id", parsed.data.id)
    .maybeSingle();

  const image = await resolveHomeImageUrl(
    supabase,
    formData,
    current?.image_url ?? "",
  );
  if ("error" in image) {
    return { ok: false, message: image.error };
  }

  const { error } = await supabase
    .from("home_blocks")
    .update({
      title: parsed.data.title,
      title_ar: parsed.data.title_ar,
      excerpt: parsed.data.excerpt,
      image_url: image.url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id);

  if (error) {
    return { ok: false, message: toasts.updateFailed };
  }

  revalidateHome();
  return { ok: true, message: toasts.updated };
}

export async function createHomeBlockAction(
  _prev: HomeBlockActionState,
  formData: FormData,
): Promise<HomeBlockActionState> {
  await requireAdmin();
  const toasts = await homeToasts();
  const common = getDictionary(await getLocale()).admin.common;

  const slugSchema = z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, toasts.slugInvalid)
    .min(2)
    .max(40);

  const createSchema = z.object({
    slug: slugSchema,
    title: z.string().trim().min(1, toasts.titleRequired).max(80),
    title_ar: z.string().trim().max(80),
    excerpt: z.string().trim().min(1, toasts.textRequired).max(500),
  });

  const parsed = createSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    title_ar: formData.get("title_ar"),
    excerpt: formData.get("excerpt"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || common.invalidFields,
    };
  }

  const supabase = await createClient();
  const image = await resolveHomeImageUrl(supabase, formData);
  if ("error" in image) {
    return { ok: false, message: image.error };
  }

  const { data: last } = await supabase
    .from("home_blocks")
    .select("sort_order")
    .is("deleted_at", null)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("home_blocks").insert({
    slug: parsed.data.slug,
    title: parsed.data.title,
    title_ar: parsed.data.title_ar,
    excerpt: parsed.data.excerpt,
    image_url: image.url,
    sort_order: (last?.sort_order ?? 0) + 1,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: toasts.slugExists };
    }
    return { ok: false, message: toasts.createFailed };
  }

  revalidateHome();
  return { ok: true, message: toasts.created };
}

export async function deleteHomeBlockAction(
  _prev: HomeBlockActionState,
  formData: FormData,
): Promise<HomeBlockActionState> {
  await requireAdmin();
  const toasts = await homeToasts();

  const id = String(formData.get("id") ?? "");
  if (!z.string().uuid().safeParse(id).success) {
    return { ok: false, message: toasts.invalidBlock };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("home_blocks")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { ok: false, message: toasts.deleteFailed };
  }

  revalidateHome();
  return { ok: true, message: toasts.deleted };
}

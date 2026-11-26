"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { createClient } from "@/lib/supabase/server";

export type AdminActionState = {
  ok: boolean;
  message: string;
} | null;

async function userCopy() {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  return {
    toasts: dictionary.admin.users.toasts,
    common: dictionary.admin.common,
  };
}

async function loadTarget(userId: string) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { toasts } = await userCopy();

  const { data: target, error } = await supabase
    .from("profiles")
    .select("id, role, deleted_at")
    .eq("id", userId)
    .maybeSingle();

  if (error || !target) {
    return {
      admin,
      supabase,
      target: null as null,
      error: toasts.notFound,
    };
  }

  return { admin, supabase, target, error: null as null };
}

export async function setUserRoleAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { toasts, common } = await userCopy();
  const userId = String(formData.get("userId") || "");
  const role = String(formData.get("role") || "");

  if (!userId || (role !== "admin" && role !== "user")) {
    return { ok: false, message: common.invalidData };
  }

  const { admin, supabase, target, error } = await loadTarget(userId);
  if (error || !target) return { ok: false, message: error || common.error };

  if (target.id === admin.id && role !== "admin") {
    return { ok: false, message: toasts.cannotRemoveOwnRole };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (updateError) {
    return {
      ok: false,
      message: updateError.message.includes("au moins un admin")
        ? toasts.lastAdmin
        : toasts.roleFailed,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/utilisateurs");
  return {
    ok: true,
    message: role === "admin" ? toasts.roleGranted : toasts.roleRevoked,
  };
}

export async function setUserActiveAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { toasts, common } = await userCopy();
  const userId = String(formData.get("userId") || "");
  const active = String(formData.get("active") || "") === "1";

  if (!userId) return { ok: false, message: common.invalidData };

  const { admin, supabase, target, error } = await loadTarget(userId);
  if (error || !target) return { ok: false, message: error || common.error };

  if (target.id === admin.id && !active) {
    return { ok: false, message: toasts.cannotDeactivateSelf };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ deleted_at: active ? null : new Date().toISOString() })
    .eq("id", userId);

  if (updateError) {
    return {
      ok: false,
      message: updateError.message.includes("au moins un admin")
        ? toasts.lastAdmin
        : toasts.updateFailed,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/utilisateurs");
  return {
    ok: true,
    message: active ? toasts.restored : toasts.deactivated,
  };
}

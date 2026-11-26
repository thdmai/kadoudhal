import { cache } from "react";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { withTimeout } from "@/lib/with-timeout";

export type SessionProfile = {
  id: string;
  email: string;
  displayName: string;
  initials: string;
  role: "user" | "admin";
};

export function initialsFrom(displayName: string, email: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]!}${parts[1]![0]!}`.toUpperCase();
  }
  if (parts[0]?.length) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (email.split("@")[0] || "?").slice(0, 2).toUpperCase();
}

/** Une seule lecture session par requête (header + page). */
export const getSessionProfile = cache(
  async (): Promise<SessionProfile | null> => {
    if (!getSupabaseEnv()) return null;

    try {
      const supabase = await createClient();

      // getUser() vérifie auprès de Supabase. Si c'est trop lent, on ne
      // déconnecte PAS : on retombe sur le JWT déjà en cookie (getSession).
      const auth = await withTimeout(supabase.auth.getUser(), 6000, null);
      let user = auth?.data.user ?? null;

      if (!user) {
        const { data: sessionData } = await supabase.auth.getSession();
        user = sessionData.session?.user ?? null;
      }

      if (!user) return null;

      const profileResult = await withTimeout(
        supabase
          .from("profiles")
          .select("display_name, email, role, deleted_at")
          .eq("id", user.id)
          .maybeSingle(),
        5000,
        null,
      );
      let profile = profileResult?.data ?? null;

      // Après un reset SQL : Auth existe encore sans ligne profiles.
      if (!profile) {
        const ensured = await withTimeout(
          supabase.rpc("ensure_own_profile"),
          3000,
          null,
        );
        if (
          ensured?.data &&
          typeof ensured.data === "object" &&
          !Array.isArray(ensured.data)
        ) {
          const row = ensured.data as {
            display_name: string;
            email: string;
            role: string;
            deleted_at: string | null;
          };
          profile = {
            display_name: row.display_name,
            email: row.email,
            role: row.role,
            deleted_at: row.deleted_at,
          };
        }
      }

      if (profile?.deleted_at) return null;

      const email = profile?.email || user.email || "";
      const displayName =
        profile?.display_name?.trim() ||
        (user.user_metadata?.display_name as string | undefined)?.trim() ||
        email.split("@")[0] ||
        "Compte";

      return {
        id: user.id,
        email,
        displayName,
        initials: initialsFrom(displayName, email),
        role: profile?.role === "admin" ? "admin" : "user",
      };
    } catch {
      return null;
    }
  },
);

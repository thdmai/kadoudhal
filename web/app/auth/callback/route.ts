import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

function safeNext(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  return next;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (!getSupabaseEnv()) {
    return NextResponse.redirect(`${origin}/connexion?error=config`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("deleted_at")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.deleted_at) {
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/connexion?error=disabled`);
        }

        // Email/MDP met à jour last_seen dans signInAction ;
        // Google (et liens email) passent ici — même traitement.
        await supabase
          .from("profiles")
          .update({ last_seen_at: new Date().toISOString() })
          .eq("id", user.id);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/connexion?error=confirm`);
}

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    return null;
  }

  return { url, key };
}

export function requireSupabaseEnv() {
  const env = getSupabaseEnv();
  if (!env) {
    const isProd =
      process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
    throw new Error(
      isProd
        ? "Supabase n’est pas configuré sur Vercel. Ajoute NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY (ou PUBLISHABLE_KEY) dans Environment Variables, puis Redeploy."
        : "Supabase n’est pas configuré. Ajoute NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local à la racine, puis relance npm run dev.",
    );
  }
  return env;
}

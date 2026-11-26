import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSessionProfile } from "@/lib/auth/profile";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";

export default async function ProfilPage() {
  const profile = await getSessionProfile();
  if (!profile) {
    redirect("/connexion?next=/profil");
  }

  const locale = await getLocale();
  const dictionary = getDictionary(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hasPassword =
    user?.identities?.some((identity) => identity.provider === "email") ??
    false;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-16">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <h1 className="font-display text-4xl text-white">
            {dictionary.profile.title}
          </h1>
          <p className="font-arabic text-2xl text-gold" dir="rtl" lang="ar">
            الملف
          </p>
        </div>
        <p className="mt-3 text-base leading-7 text-white/90">
          {dictionary.profile.subtitle}
        </p>
        <ProfileForm
          displayName={profile.displayName}
          email={profile.email}
          hasPassword={hasPassword}
        />
        <Link href="/" className="auth-link mt-8 text-sm">
          {dictionary.profile.back}
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}

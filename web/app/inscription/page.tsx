import { AuthHeading } from "@/components/auth-ornaments";
import { AuthShell } from "@/components/auth-shell";
import { safeContentPath } from "@/lib/auth/paths";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { SignupForm } from "./signup-form";

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; error?: string | string[] }>;
}) {
  const params = await searchParams;
  const next = safeContentPath(
    typeof params.next === "string" ? params.next : undefined,
  );
  const error = typeof params.error === "string" ? params.error : null;
  const locale = await getLocale();
  const dictionary = getDictionary(locale);

  return (
    <AuthShell>
      <AuthHeading
        title={dictionary.auth.signupTitle}
        arabic="أهلاً وسهلاً بكم"
      />
      <p className="mt-3 text-center text-base leading-7 text-[var(--auth-muted)]">
        {dictionary.auth.signupLead}
      </p>
      {error === "oauth" ? (
        <p className="auth-error mt-4">{dictionary.auth.errors.oauth}</p>
      ) : null}
      <SignupForm nextPath={next} />
    </AuthShell>
  );
}

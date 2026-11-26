import { AuthHeading } from "@/components/auth-ornaments";
import { AuthShell } from "@/components/auth-shell";
import { contentLabel, safeContentPath } from "@/lib/auth/paths";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { LoginForm } from "./login-form";

export default async function ConnexionPage({
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
        title={dictionary.auth.loginTitle}
        arabic="مرحباً بكم مرة أخرى"
      />
      <p className="mt-3 text-center text-base leading-7 text-[var(--auth-muted)]">
        {interpolate(dictionary.auth.loginLead, {
          content: contentLabel(next, dictionary.collections),
        })}
      </p>
      {error === "confirm" ? (
        <p className="auth-error mt-4">{dictionary.auth.errors.confirm}</p>
      ) : null}
      {error === "config" ? (
        <p className="auth-error mt-4">{dictionary.auth.errors.config}</p>
      ) : null}
      {error === "oauth" ? (
        <p className="auth-error mt-4">{dictionary.auth.errors.oauth}</p>
      ) : null}
      {error === "disabled" ? (
        <p className="auth-error mt-4">{dictionary.auth.errors.disabled}</p>
      ) : null}
      <LoginForm nextPath={next} />
    </AuthShell>
  );
}

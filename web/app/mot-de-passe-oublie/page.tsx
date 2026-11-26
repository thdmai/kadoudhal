import { AuthHeading } from "@/components/auth-ornaments";
import { AuthShell } from "@/components/auth-shell";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { ForgotPasswordForm } from "./forgot-password-form";

export default async function MotDePasseOubliePage() {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);

  return (
    <AuthShell>
      <AuthHeading
        title={dictionary.auth.forgotTitle}
        arabic="إعادة تعيين"
      />
      <p className="mt-2 text-center text-sm leading-6 text-[var(--auth-muted)]">
        {dictionary.auth.forgotLead}
      </p>
      <ForgotPasswordForm />
    </AuthShell>
  );
}

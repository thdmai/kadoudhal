"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction } from "@/app/auth/actions";
import { useActionToast } from "@/components/toast";
import type { AuthFormState } from "@/lib/auth/schemas";
import { useDictionary } from "@/lib/i18n/provider";

const initialState: AuthFormState | null = null;

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initialState,
  );
  useActionToast(state);
  const dictionary = useDictionary();

  return (
    <div className="mt-5 flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-3.5">
        <label className="flex flex-col gap-1.5 text-sm text-[var(--auth-text)]">
          {dictionary.auth.email}
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={dictionary.auth.emailPlaceholder}
            className="auth-field"
          />
        </label>
        {state?.fieldErrors?.email?.[0] ? (
          <p className="text-sm text-red-700">{state.fieldErrors.email[0]}</p>
        ) : null}

        <button type="submit" className="auth-button" disabled={pending}>
          {pending ? dictionary.auth.sending : dictionary.auth.sendLink}
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link href="/connexion" className="auth-link">
          {dictionary.auth.signInArrow}
        </Link>
        <Link href="/inscription" className="auth-link-muted">
          {dictionary.auth.createAccount}
        </Link>
      </div>
    </div>
  );
}

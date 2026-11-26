"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, signInWithGoogleAction } from "@/app/auth/actions";
import { GoogleMark } from "@/components/google-mark";
import { PasswordField } from "@/components/password-field";
import { useActionToast } from "@/components/toast";
import type { AuthFormState } from "@/lib/auth/schemas";
import { useDictionary } from "@/lib/i18n/provider";

const initialState: AuthFormState | null = null;

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
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

        <PasswordField
          name="password"
          label={dictionary.auth.password}
          autoComplete="current-password"
          placeholder={dictionary.auth.passwordPlaceholder}
          error={state?.fieldErrors?.password?.[0]}
          tone="light"
        />

        <div className="flex justify-end text-sm">
          <Link
            href="/mot-de-passe-oublie"
            className="auth-link relative z-10 py-1"
          >
            {dictionary.auth.forgotLink}
          </Link>
        </div>

        <input type="hidden" name="next" value={nextPath} />
        <button type="submit" className="auth-button" disabled={pending}>
          {pending ? dictionary.auth.signingIn : dictionary.auth.signIn}
        </button>
      </form>

      <p className="auth-divider">{dictionary.auth.orContinue}</p>

      <form action={signInWithGoogleAction}>
        <input type="hidden" name="next" value={nextPath} />
        <input type="hidden" name="returnTo" value="/connexion" />
        <button type="submit" className="auth-button-google">
          <GoogleMark />
          {dictionary.auth.continueGoogle}
        </button>
      </form>

      <p className="text-center text-sm font-medium text-[var(--auth-text)]">
        {dictionary.auth.noAccount}{" "}
        <Link
          href={`/inscription?next=${encodeURIComponent(nextPath)}`}
          className="auth-link relative z-10"
        >
          {dictionary.auth.createAccount}
        </Link>
      </p>
    </div>
  );
}

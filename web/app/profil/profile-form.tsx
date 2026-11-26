"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/app/auth/actions";
import { PasswordField } from "@/components/password-field";
import { useActionToast } from "@/components/toast";
import type { AuthFormState } from "@/lib/auth/schemas";
import { useDictionary } from "@/lib/i18n/provider";

const initialState: AuthFormState | null = null;

type ProfileFormProps = {
  displayName: string;
  email: string;
  hasPassword: boolean;
};

export function ProfileForm({
  displayName,
  email,
  hasPassword,
}: ProfileFormProps) {
  const [state, action, pending] = useActionState(
    updateProfileAction,
    initialState,
  );
  useActionToast(state);
  const dictionary = useDictionary();

  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm text-white">
        {dictionary.profile.displayName}
        <input
          name="displayName"
          type="text"
          required
          minLength={2}
          maxLength={80}
          defaultValue={displayName}
          autoComplete="name"
          className="auth-field"
        />
      </label>
      {state?.fieldErrors?.displayName?.[0] ? (
        <p className="text-sm text-red-300">{state.fieldErrors.displayName[0]}</p>
      ) : null}

      <label className="flex flex-col gap-1.5 text-sm text-white">
        {dictionary.profile.email}
        <input
          name="email"
          type="email"
          required
          defaultValue={email}
          autoComplete="email"
          className="auth-field"
        />
      </label>
      {state?.fieldErrors?.email?.[0] ? (
        <p className="text-sm text-red-300">{state.fieldErrors.email[0]}</p>
      ) : null}

      <PasswordField
        name="password"
        label={
          hasPassword
            ? dictionary.profile.newPasswordOptional
            : dictionary.profile.setPasswordOptional
        }
        autoComplete="new-password"
        required={false}
        minLength={8}
        placeholder={
          hasPassword
            ? dictionary.profile.passwordPlaceholderKeep
            : dictionary.profile.passwordPlaceholderGoogle
        }
        error={state?.fieldErrors?.password?.[0]}
        tone="dark"
      />

      <PasswordField
        name="passwordConfirm"
        label={dictionary.profile.confirmNewPassword}
        autoComplete="new-password"
        required={false}
        minLength={8}
        placeholder={dictionary.profile.confirmPasswordPlaceholder}
        error={state?.fieldErrors?.passwordConfirm?.[0]}
        tone="dark"
      />

      {hasPassword ? (
        <PasswordField
          name="currentPassword"
          label={dictionary.profile.currentPassword}
          autoComplete="current-password"
          placeholder={dictionary.profile.currentPasswordPlaceholder}
          error={state?.fieldErrors?.currentPassword?.[0]}
          tone="dark"
        />
      ) : (
        <p className="text-sm text-white/65">{dictionary.profile.googleNote}</p>
      )}

      <button type="submit" className="auth-button mt-1" disabled={pending}>
        {pending ? dictionary.profile.saving : dictionary.profile.save}
      </button>
    </form>
  );
}

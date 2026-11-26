"use client";

import { useId, useState } from "react";
import { useDictionary } from "@/lib/i18n/provider";

type PasswordFieldProps = {
  name: string;
  label: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  error?: string;
  tone?: "light" | "dark";
};

export function PasswordField({
  name,
  label,
  autoComplete = "current-password",
  placeholder = "••••••••",
  required = true,
  minLength = 8,
  error,
  tone = "light",
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();
  const dictionary = useDictionary();
  const labelClass =
    tone === "light" ? "text-sm text-[var(--auth-text)]" : "text-sm text-white";
  const toggleClass =
    tone === "light"
      ? "absolute inset-y-0 end-0 flex items-center px-3 text-[var(--auth-muted)] transition-colors hover:text-[var(--auth-accent)]"
      : "absolute inset-y-0 end-0 flex items-center px-3 text-muted transition-colors hover:text-gold";
  const errorClass =
    tone === "light" ? "text-sm text-red-700" : "text-sm text-red-300";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          autoComplete={autoComplete}
          minLength={minLength}
          placeholder={placeholder}
          className="auth-field auth-field-password"
        />
        <button
          type="button"
          className={toggleClass}
          onClick={() => setVisible((value) => !value)}
          aria-label={
            visible
              ? dictionary.auth.hidePassword
              : dictionary.auth.showPassword
          }
          aria-pressed={visible}
        >
          {visible ? (
            <i className="text-base not-italic" aria-hidden>
              🙈
            </i>
          ) : (
            <i className="text-base not-italic" aria-hidden>
              👁
            </i>
          )}
        </button>
      </div>
      {error ? <p className={errorClass}>{error}</p> : null}
    </div>
  );
}

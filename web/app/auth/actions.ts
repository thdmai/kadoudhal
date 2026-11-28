"use server";

import { redirect } from "next/navigation";
import { flattenError } from "zod";
import {
  forgotPasswordSchema,
  loginSchema,
  signupSchema,
  updateProfileSchema,
  type AuthFormState,
} from "@/lib/auth/schemas";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

function missingEnvState(): AuthFormState {
  const isProd = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
  return {
    ok: false,
    message: isProd
      ? "Supabase n’est pas branché sur Vercel. Ajoute NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY (ou PUBLISHABLE_KEY) dans Project → Settings → Environment Variables, puis Redeploy."
      : "Supabase n’est pas branché. Vérifie .env.local à la racine (NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY ou PUBLISHABLE_KEY), puis relance npm run dev.",
  };
}

function firstFieldError(
  fieldErrors: Record<string, string[] | undefined>,
): string {
  for (const messages of Object.values(fieldErrors)) {
    if (messages?.[0]) return messages[0];
  }
  return "Vérifie les champs du formulaire.";
}

function siteOrigin() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export async function signInAction(
  _prev: AuthFormState | null,
  formData: FormData,
): Promise<AuthFormState> {
  if (!getSupabaseEnv()) return missingEnvState();

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    const fieldErrors = flattenError(parsed.error).fieldErrors;
    return {
      ok: false,
      message: firstFieldError(fieldErrors),
      fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      ok: false,
      message:
        error.message === "Email not confirmed"
          ? "Confirme d’abord ton email (regarde ta boîte de réception)."
          : "Email ou mot de passe incorrect.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Connexion impossible pour le moment." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("deleted_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.deleted_at) {
    await supabase.auth.signOut();
    return {
      ok: false,
      message: "Ce compte a été désactivé. Contacte l’administration.",
    };
  }

  await supabase
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", user.id);

  redirect(parsed.data.next);
}

function safePath(value: FormDataEntryValue | null, fallback: string) {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : fallback;
}

export async function signInWithGoogleAction(formData: FormData) {
  if (!getSupabaseEnv()) {
    redirect("/connexion?error=config");
  }

  const next = safePath(formData.get("next"), "/coran");
  const fallbackPath = safePath(formData.get("returnTo"), "/connexion");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    redirect(`${fallbackPath}?error=oauth`);
  }

  redirect(data.url);
}

export async function signUpAction(
  _prev: AuthFormState | null,
  formData: FormData,
): Promise<AuthFormState> {
  if (!getSupabaseEnv()) return missingEnvState();

  const parsed = signupSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    const fieldErrors = flattenError(parsed.error).fieldErrors;
    return {
      ok: false,
      message: firstFieldError(fieldErrors),
      fieldErrors,
    };
  }

  const supabase = await createClient();
  const emailRedirectTo = `${siteOrigin()}/auth/callback?next=${encodeURIComponent(parsed.data.next)}`;

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo,
    },
  });

  if (error) {
    return {
      ok: false,
      message:
        error.message.includes("already registered") ||
        error.message.includes("already been registered")
          ? "Un compte existe déjà avec cet email. Connecte-toi ou réinitialise le mot de passe."
          : error.message,
    };
  }

  if (data.session) {
    redirect(parsed.data.next);
  }

  return {
    ok: true,
    message:
      "Compte créé. Un email de confirmation t’a été envoyé. Ouvre le lien pour activer ton compte, puis connecte-toi.",
  };
}

export async function forgotPasswordAction(
  _prev: AuthFormState | null,
  formData: FormData,
): Promise<AuthFormState> {
  if (!getSupabaseEnv()) return missingEnvState();

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    const fieldErrors = flattenError(parsed.error).fieldErrors;
    return {
      ok: false,
      message: firstFieldError(fieldErrors),
      fieldErrors,
    };
  }

  const supabase = await createClient();
  // Après le clic email → session recovery → page profil pour choisir un nouveau MDP.
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteOrigin()}/auth/callback?next=/profil`,
  });

  if (error) {
    const raw = error.message.toLowerCase();
    const smtpHint =
      raw.includes("sending") ||
      raw.includes("smtp") ||
      raw.includes("recovery email") ||
      raw.includes("error sending");

    return {
      ok: false,
      message: smtpHint
        ? "L’email n’a pas pu partir. Dans Supabase → Authentication → Emails : active un SMTP (ex. Gmail app password) et vérifie Redirect URLs (http://localhost:3000/auth/callback)."
        : error.message,
    };
  }

  return {
    ok: true,
    message:
      "Si un compte existe pour cet email, un lien de réinitialisation vient d’être envoyé. Vérifie aussi les spams.",
  };
}

export async function signOutAction() {
  if (!getSupabaseEnv()) {
    redirect("/");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateProfileAction(
  _prev: AuthFormState | null,
  formData: FormData,
): Promise<AuthFormState> {
  if (!getSupabaseEnv()) return missingEnvState();

  const parsed = updateProfileSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password") || undefined,
    passwordConfirm: formData.get("passwordConfirm") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors = flattenError(parsed.error).fieldErrors;
    return {
      ok: false,
      message: firstFieldError(fieldErrors),
      fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { ok: false, message: "Connecte-toi pour modifier ton profil." };
  }

  // Compte email/mdp uniquement — Google seul n’a pas de mot de passe actuel
  const hasPassword =
    user.identities?.some((identity) => identity.provider === "email") ?? false;

  if (hasPassword) {
    if (!parsed.data.currentPassword || parsed.data.currentPassword.length < 8) {
      return {
        ok: false,
        message: "Le mot de passe actuel doit contenir au moins 8 caractères",
        fieldErrors: {
          currentPassword: [
            "Le mot de passe actuel doit contenir au moins 8 caractères",
          ],
        },
      };
    }

    const { error: checkError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.currentPassword,
    });

    if (checkError) {
      return { ok: false, message: "Mot de passe actuel incorrect." };
    }
  }

  const messages: string[] = [];
  const emailChanged =
    parsed.data.email.toLowerCase() !== user.email.toLowerCase();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    return { ok: false, message: profileError.message };
  }

  messages.push("Nom mis à jour");

  const authUpdate: { email?: string; password?: string; data?: object } = {
    data: { display_name: parsed.data.displayName },
  };

  if (emailChanged) {
    authUpdate.email = parsed.data.email;
  }
  if (parsed.data.password) {
    authUpdate.password = parsed.data.password;
  }

  if (emailChanged || parsed.data.password) {
    const { error: authError } = await supabase.auth.updateUser(authUpdate);
    if (authError) {
      return { ok: false, message: authError.message };
    }
    if (emailChanged) {
      messages.push(
        "un email de confirmation a été envoyé pour la nouvelle adresse",
      );
    }
    if (parsed.data.password) {
      messages.push("mot de passe mis à jour");
    }
  }

  return {
    ok: true,
    message: `${messages.join(". ")}.`,
  };
}

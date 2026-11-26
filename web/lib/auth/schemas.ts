import { z } from "zod";

const nextPath = z
  .string()
  .optional()
  .transform((value) => {
    if (!value || !value.startsWith("/") || value.startsWith("//")) {
      return "/coran";
    }
    return value;
  });

export const loginSchema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  next: nextPath,
});

export const signupSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(80, "Le nom est trop long"),
    email: z.email("Email invalide"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .max(72, "Le mot de passe est trop long"),
    passwordConfirm: z.string(),
    next: nextPath,
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirm"],
  });

export const forgotPasswordSchema = z.object({
  email: z.email("Email invalide"),
});

export const updateProfileSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(80, "Le nom est trop long"),
    email: z.email("Email invalide"),
    // Optionnel : requis seulement si le compte a un mot de passe (pas Google seul)
    currentPassword: z
      .string()
      .optional()
      .transform((value) => value?.trim() || undefined),
    password: z
      .string()
      .max(72, "Le mot de passe est trop long")
      .optional()
      .transform((value) => value?.trim() || undefined),
    passwordConfirm: z
      .string()
      .optional()
      .transform((value) => value?.trim() || undefined),
  })
  .superRefine((data, ctx) => {
    if (data.password && data.password.length < 8) {
      ctx.addIssue({
        code: "custom",
        message: "Le nouveau mot de passe doit contenir au moins 8 caractères",
        path: ["password"],
      });
    }
    if (data.password && data.password !== data.passwordConfirm) {
      ctx.addIssue({
        code: "custom",
        message: "Les mots de passe ne correspondent pas",
        path: ["passwordConfirm"],
      });
    }
    if (!data.password && data.passwordConfirm) {
      ctx.addIssue({
        code: "custom",
        message: "Indique aussi le nouveau mot de passe",
        path: ["password"],
      });
    }
  });

export type AuthFormState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

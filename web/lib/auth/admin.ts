import { cache } from "react";
import { redirect } from "next/navigation";
import { getSessionProfile, type SessionProfile } from "@/lib/auth/profile";

export type AdminProfile = SessionProfile & { role: "admin" };

export const requireAdmin = cache(async (): Promise<AdminProfile> => {
  const profile = await getSessionProfile();
  if (!profile) {
    redirect("/connexion?next=/admin");
  }
  if (profile.role !== "admin") {
    redirect("/");
  }
  return { ...profile, role: "admin" };
});

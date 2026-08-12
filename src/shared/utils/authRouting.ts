import type { User as FirebaseUser } from "firebase/auth";
import type { Href } from "expo-router";
import { resolveIsAdmin } from "@/shared/constants/admin";

export const VERIFY_EMAIL_HREF = "/(auth)/verifyEmail" as Href;
export const LOGIN_HREF = "/(auth)/login" as Href;

export function isEmailVerified(user: FirebaseUser | null | undefined): boolean {
  return Boolean(user?.emailVerified);
}

export function getPostLoginHref(
  authEmail?: string | null,
  profileEmail?: string | null,
): Href {
  return resolveIsAdmin(authEmail, profileEmail)
    ? ("/admin" as Href)
    : ("/(drawer)" as Href);
}

/**
 * Destino após sessão autenticada válida (e-mail confirmado + perfil no app).
 * Contas pendentes de confirmação não devem permanecer logadas.
 */
export function getPostAuthHref(
  user: FirebaseUser | null | undefined,
  profileEmail?: string | null,
  hasProfile = true,
): Href {
  if (!user) return LOGIN_HREF;
  if (!user.emailVerified || !hasProfile) return VERIFY_EMAIL_HREF;
  return getPostLoginHref(user.email, profileEmail);
}

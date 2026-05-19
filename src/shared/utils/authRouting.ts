import type { Href } from "expo-router";
import { isAdminEmail, resolveIsAdmin } from "@/shared/constants/admin";

export function getPostLoginHref(
  authEmail?: string | null,
  profileEmail?: string | null,
): Href {
  return resolveIsAdmin(authEmail, profileEmail)
    ? ("/admin" as Href)
    : ("/(drawer)" as Href);
}


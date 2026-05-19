const ADMIN_EMAILS = ["jhonatasjhmj13@gmail.com"] as const;

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email?.trim()) return false;
  return (ADMIN_EMAILS as readonly string[]).includes(normalizeAdminEmail(email));
}

export function resolveIsAdmin(
  authEmail?: string | null,
  profileEmail?: string | null,
): boolean {
  return isAdminEmail(authEmail) || isAdminEmail(profileEmail);
}

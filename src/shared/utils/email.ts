export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function encodeEmailKey(email: string) {
  return normalizeEmail(email).replace(/\./g, ",").replace(/@/g, "_");
}

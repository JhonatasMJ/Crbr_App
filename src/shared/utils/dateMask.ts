export function maskDate(value: string): string {
  let cleaned = value.replace(/\D/g, "");


  cleaned = cleaned.slice(0, 8);

  if (cleaned.length >= 5) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
  }

  if (cleaned.length >= 3) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  }

  return cleaned;
}
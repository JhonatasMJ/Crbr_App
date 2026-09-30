type UserNameSource = {
  username?: string;
  name?: string;
};

export function resolveUserDisplayName(
  profile?: UserNameSource | null,
  displayName?: string | null,
): string {
  const fromProfile = profile?.username?.trim() || profile?.name?.trim();
  if (fromProfile) return fromProfile;
  return displayName?.trim() || "";
}

/** Primeira letra de cada palavra em maiúscula ("cota reserva" → "Cota Reserva"). */
export function capitalizeWords(value?: string): string {
  return (value ?? "")
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getFirstName(fullName: string) {
    return fullName.split(" ")[0];
  };

export function formatName(name?: string): string {
    if (!name) return "";
  
    const parts = name.trim().split(" ");
  

    if (parts.length === 1) {
      return parts[0];
    }
  
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
  
   
    if (parts.length === 2) {
      return `${firstName} ${lastName}`;
    }
  
    const middleInitial = parts[1].charAt(0).toUpperCase();
  
    return `${firstName} ${middleInitial}. ${lastName}`;
  }
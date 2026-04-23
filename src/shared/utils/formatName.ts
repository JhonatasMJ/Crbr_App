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
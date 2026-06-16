import { get, ref } from "firebase/database";
import { database } from "@/shared/services/firebase";
import { normalizeCpf } from "@/shared/utils/cpf";

export async function isCpfAlreadyRegistered(rawCpf: string): Promise<boolean> {
  const normalized = normalizeCpf(rawCpf);
  if (!normalized) return false;

  const indexSnap = await get(ref(database, `cpfIndex/${normalized}`));
  return indexSnap.exists();
}

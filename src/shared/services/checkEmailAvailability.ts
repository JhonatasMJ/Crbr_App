import { get, ref } from "firebase/database";
import { database } from "@/shared/services/firebase";
import { encodeEmailKey } from "@/shared/utils/email";

export async function isEmailAlreadyRegistered(email: string): Promise<boolean> {
  const key = encodeEmailKey(email);
  if (!key) return false;

  const indexSnap = await get(ref(database, `emailIndex/${key}`));
  return indexSnap.exists();
}

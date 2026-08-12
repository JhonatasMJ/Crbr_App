import * as SecureStore from "expo-secure-store";
import type { RegisterParams } from "@/types/registerParams";
import { normalizeEmail } from "@/shared/utils/email";
import { normalizeCpf } from "@/shared/utils/cpf";

const PENDING_REGISTRATION_KEY = "crbr_pending_registration";

export type PendingRegistration = {
  name: string;
  email: string;
  cpf: string;
  phoneNumber: string;
  birthDate: string;
  city: string;
  password: string;
};

export function toPendingRegistration(
  data: RegisterParams,
): PendingRegistration {
  return {
    name: data.name.trim(),
    email: normalizeEmail(data.email),
    cpf: normalizeCpf(data.cpf),
    phoneNumber: data.phoneNumber.trim(),
    birthDate: data.birthDate.trim(),
    city: data.city.trim(),
    password: data.password,
  };
}

export async function persistPendingRegistration(
  data: PendingRegistration,
): Promise<void> {
  await SecureStore.setItemAsync(
    PENDING_REGISTRATION_KEY,
    JSON.stringify(data),
  );
}

export async function getPendingRegistration(): Promise<PendingRegistration | null> {
  try {
    const raw = await SecureStore.getItemAsync(PENDING_REGISTRATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingRegistration>;
    if (
      typeof parsed.name === "string" &&
      typeof parsed.email === "string" &&
      typeof parsed.cpf === "string" &&
      typeof parsed.phoneNumber === "string" &&
      typeof parsed.birthDate === "string" &&
      typeof parsed.city === "string" &&
      typeof parsed.password === "string"
    ) {
      return {
        name: parsed.name,
        email: normalizeEmail(parsed.email),
        cpf: normalizeCpf(parsed.cpf),
        phoneNumber: parsed.phoneNumber,
        birthDate: parsed.birthDate,
        city: parsed.city,
        password: parsed.password,
      };
    }
  } catch {
    /* JSON inválido ou SecureStore indisponível */
  }
  return null;
}

export async function clearPendingRegistration(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(PENDING_REGISTRATION_KEY);
  } catch {
    /* item pode não existir */
  }
}

import { cpf as cpfValidator } from "cpf-cnpj-validator";
import { onlyNumbers } from "@/shared/utils/masks/cpfMask";

export function normalizeCpf(value: string) {
  return onlyNumbers(value);
}

export function isValidCpf(value: string) {
  return cpfValidator.isValid(value);
}

export function formatCpf(value: string) {
  return cpfValidator.format(normalizeCpf(value));
}

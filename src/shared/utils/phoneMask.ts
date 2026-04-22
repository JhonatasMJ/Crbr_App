import type { PhoneCountry } from "@/shared/utils/phoneCountries";
import { maskPhone as maskBrazilNational } from "@/shared/utils/cpfMask";

/** Formata apenas os dígitos do número nacional (sem DDI), por país. */
export function maskPhoneNational(country: PhoneCountry, value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, country.maxDigits);

  switch (country.id) {
    case "BR":
      return maskBrazilNational(digits);

    case "NANP":
      return formatNANP(digits);

    case "PT":
    case "AO":
    case "PE":
    case "AU":
      return formatGrouped(digits, [3, 3, 3]);

    case "MZ":
      return formatGrouped(digits, [2, 3, 4]);

    case "ES":
      return formatGrouped(digits, [3, 2, 2, 2]);

    case "FR":
      return formatGrouped(digits, [2, 2, 2, 2, 1]);

    case "DE":
      return formatDE(digits);

    case "IT":
      return formatGrouped(digits, [3, 3, 4]);

    case "GB":
      return formatGrouped(digits, [5, 6]);

    case "AR":
      return formatAR(digits);

    case "CL":
      return formatGrouped(digits, [1, 4, 4]);

    case "UY":
      return formatGrouped(digits, [1, 3, 4]);

    case "BO":
      return formatGrouped(digits, [1, 7]);

    case "EC":
      return formatGrouped(digits, [2, 3, 4]);

    case "JP":
      return formatGrouped(digits, [2, 4, 4]);

    case "ZA":
      return formatGrouped(digits, [2, 3, 4]);

    case "MX":
      return formatGrouped(digits, [2, 4, 4]);

    case "CO":
      return formatGrouped(digits, [3, 7]);

    case "PY":
      return formatGrouped(digits, [3, 6]);

    case "CN":
      return formatGrouped(digits, [3, 4, 4]);

    case "IN":
      return formatGrouped(digits, [5, 5]);

    default:
      return digits;
  }
}

function formatGrouped(digits: string, groups: number[]): string {
  let rest = digits;
  const parts: string[] = [];
  const total = groups.reduce((a, b) => a + b, 0);
  rest = rest.slice(0, total);

  for (const g of groups) {
    if (!rest.length) break;
    parts.push(rest.slice(0, g));
    rest = rest.slice(g);
  }

  return parts.join(" ");
}

function formatNANP(digits: string): string {
  const x = digits.slice(0, 10);
  const a = x.slice(0, 3);
  const b = x.slice(3, 6);
  const c = x.slice(6, 10);
  if (!x.length) return "";
  if (x.length <= 3) return a;
  if (x.length <= 6) return `(${a}) ${b}`;
  return `(${a}) ${b}-${c}`;
}

function formatDE(digits: string): string {
  const n = digits.slice(0, 11);
  if (!n.length) return "";
  if (n.length <= 3) return n;
  return `${n.slice(0, 3)} ${n.slice(3)}`;
}

function formatAR(digits: string): string {
  const n = digits.slice(0, 10);
  if (!n.length) return "";
  if (n.length <= 2) return n;
  if (n.length <= 6) return `${n.slice(0, 2)} ${n.slice(2)}`;
  return `${n.slice(0, 2)} ${n.slice(2, 6)}-${n.slice(6)}`;
}

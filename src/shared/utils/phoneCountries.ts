export type PhoneCountry = {
  id: string;
  iso: string;
  name: string;
  dial: string;
  minDigits: number;
  maxDigits: number;
};

export const DEFAULT_COUNTRY_ID = "BR";

/** Ordem: mais específico (DDI longo) primeiro — usado no parse */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  {
    id: "BR",
    iso: "BR",
    name: "Brasil",
    dial: "55",
    minDigits: 10,
    maxDigits: 11,
  },
  {
    id: "PT",
    iso: "PT",
    name: "Portugal",
    dial: "351",
    minDigits: 9,
    maxDigits: 9,
  },
  {
    id: "AO",
    iso: "AO",
    name: "Angola",
    dial: "244",
    minDigits: 9,
    maxDigits: 9,
  },
  {
    id: "MZ",
    iso: "MZ",
    name: "Moçambique",
    dial: "258",
    minDigits: 9,
    maxDigits: 9,
  },
  {
    id: "NANP",
    iso: "US",
    name: "EUA / Canadá (+1)",
    dial: "1",
    minDigits: 10,
    maxDigits: 10,
  },
  {
    id: "ES",
    iso: "ES",
    name: "Espanha",
    dial: "34",
    minDigits: 9,
    maxDigits: 9,
  },
  {
    id: "FR",
    iso: "FR",
    name: "França",
    dial: "33",
    minDigits: 9,
    maxDigits: 9,
  },
  {
    id: "DE",
    iso: "DE",
    name: "Alemanha",
    dial: "49",
    minDigits: 10,
    maxDigits: 11,
  },
  {
    id: "IT",
    iso: "IT",
    name: "Itália",
    dial: "39",
    minDigits: 9,
    maxDigits: 10,
  },
  {
    id: "GB",
    iso: "GB",
    name: "Reino Unido",
    dial: "44",
    minDigits: 10,
    maxDigits: 10,
  },
  {
    id: "AR",
    iso: "AR",
    name: "Argentina",
    dial: "54",
    minDigits: 10,
    maxDigits: 10,
  },
  {
    id: "CL",
    iso: "CL",
    name: "Chile",
    dial: "56",
    minDigits: 9,
    maxDigits: 9,
  },
  {
    id: "CO",
    iso: "CO",
    name: "Colômbia",
    dial: "57",
    minDigits: 10,
    maxDigits: 10,
  },
  {
    id: "MX",
    iso: "MX",
    name: "México",
    dial: "52",
    minDigits: 10,
    maxDigits: 10,
  },
  {
    id: "PE",
    iso: "PE",
    name: "Peru",
    dial: "51",
    minDigits: 9,
    maxDigits: 9,
  },
  {
    id: "UY",
    iso: "UY",
    name: "Uruguai",
    dial: "598",
    minDigits: 8,
    maxDigits: 8,
  },
  {
    id: "PY",
    iso: "PY",
    name: "Paraguai",
    dial: "595",
    minDigits: 9,
    maxDigits: 9,
  },
  {
    id: "BO",
    iso: "BO",
    name: "Bolívia",
    dial: "591",
    minDigits: 8,
    maxDigits: 8,
  },
  {
    id: "EC",
    iso: "EC",
    name: "Equador",
    dial: "593",
    minDigits: 9,
    maxDigits: 9,
  },
  {
    id: "JP",
    iso: "JP",
    name: "Japão",
    dial: "81",
    minDigits: 10,
    maxDigits: 10,
  },
  {
    id: "CN",
    iso: "CN",
    name: "China",
    dial: "86",
    minDigits: 11,
    maxDigits: 11,
  },
  {
    id: "IN",
    iso: "IN",
    name: "Índia",
    dial: "91",
    minDigits: 10,
    maxDigits: 10,
  },
  {
    id: "AU",
    iso: "AU",
    name: "Austrália",
    dial: "61",
    minDigits: 9,
    maxDigits: 9,
  },
  {
    id: "ZA",
    iso: "ZA",
    name: "África do Sul",
    dial: "27",
    minDigits: 9,
    maxDigits: 9,
  },
];

const BY_ID = new Map(PHONE_COUNTRIES.map((c) => [c.id, c]));

export function getCountryById(id: string): PhoneCountry | undefined {
  return BY_ID.get(id);
}

const SORTED_BY_DIAL_DESC = [...PHONE_COUNTRIES].sort(
  (a, b) => b.dial.length - a.dial.length,
);

export function parseStoredPhone(stored: string): {
  country: PhoneCountry;
  nationalRaw: string;
} {
  const fallback = getCountryById(DEFAULT_COUNTRY_ID)!;
  const trimmed = stored?.trim() ?? "";
  if (!trimmed) {
    return { country: fallback, nationalRaw: "" };
  }

  const withPlus = trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
  const digitsOnly = withPlus.slice(1).replace(/\D/g, "");

  for (const c of SORTED_BY_DIAL_DESC) {
    if (digitsOnly.startsWith(c.dial)) {
      return {
        country: c,
        nationalRaw: digitsOnly.slice(c.dial.length),
      };
    }
  }

  return { country: fallback, nationalRaw: digitsOnly };
}

export function composeStoredPhone(
  country: PhoneCountry,
  nationalRaw: string,
): string {
  const digits = nationalRaw.replace(/\D/g, "");
  if (!digits) return "";
  return `+${country.dial}${digits}`;
}

export function isCompletePhone(stored: string | undefined): boolean {
  if (!stored?.trim()) return false;
  const { country, nationalRaw } = parseStoredPhone(stored);
  const n = nationalRaw.replace(/\D/g, "").length;
  return n >= country.minDigits && n <= country.maxDigits;
}

export const PHONE_COUNTRIES_BY_NAME = [...PHONE_COUNTRIES].sort((a, b) =>
  a.name.localeCompare(b.name, "pt-BR"),
);

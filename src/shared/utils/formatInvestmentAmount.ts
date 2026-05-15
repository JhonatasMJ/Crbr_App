function parseAmountValue(value?: string | number): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const parsed = Number(
    String(value ?? "0")
      .replace(/[^\d,.-]/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
  );

  return Number.isFinite(parsed) ? parsed : 0;
}

/** Valor numérico em BRL sem símbolo, ex.: `7.000,00`. */
export function formatAmountPlain(value?: string | number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseAmountValue(value));
}

export function formatInvestmentAmount(value?: string | number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parseAmountValue(value));
}

export function formatInvestmentAmount(value?: string | number): string {
  const parsedAmount =
    typeof value === "number"
      ? value
      : Number(
          String(value ?? "0")
            .replace(/[^\d,.-]/g, "")
            .replace(/\./g, "")
            .replace(",", ".")
        );

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(parsedAmount) ? parsedAmount : 0);
}

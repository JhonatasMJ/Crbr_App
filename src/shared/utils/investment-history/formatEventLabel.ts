const TYPE_LABELS: Record<string, string> = {
  criacao: "Investimento criado",
  exclusao: "Cota excluída",
  saque: "Saque",
  "saque-total": "Saque total",
  saque_total: "Saque total",
  "saque total": "Saque total",
  "saque-parcial": "Saque de rendimento",
  saque_parcial: "Saque de rendimento",
  "saque parcial": "Saque parcial",
  reinvestimento: "Reinvestimento",
  reinvest: "Reinvestimento",
  aporte: "Aporte",
  "withdraw-full": "Saque total",
  "withdraw-partial": "Saque de rendimento",
  withdraw_partial: "Saque de rendimento",
  "solicitacao de saque total": "Solicitação de saque total",
  "solicitacao de saque de rendimento": "Solicitação de saque de rendimento",
  "solicitacao de reinvestimento": "Solicitação de reinvestimento",
  evento: "Movimentação",
};

function labelLookupKeys(type: string): string[] {
  const base = type.trim().toLowerCase();
  return [
    base,
    base.replace(/_/g, "-"),
    base.replace(/-/g, "_"),
    base.replace(/[_-]+/g, " "),
  ];
}

function toTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatEventLabel(type: string): string {
  const trimmed = type.trim();
  if (!trimmed) return "Movimentação";

  for (const key of labelLookupKeys(trimmed)) {
    if (TYPE_LABELS[key]) return TYPE_LABELS[key];
  }

  return toTitleCase(trimmed.replace(/[_-]+/g, " "));
}

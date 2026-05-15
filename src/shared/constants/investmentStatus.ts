export const INVESTMENT_STATUS = {
  ACTIVE: "Ativo",
  PENDING: "Pendente",
  INACTIVE: "Inativo",
} as const;

export type InvestmentStatus =
  (typeof INVESTMENT_STATUS)[keyof typeof INVESTMENT_STATUS];

export function isInvestmentActive(status?: string): boolean {
  return status?.trim().toLowerCase() === "ativo";
}

export function getInvestmentStatusLabel(status?: string): string {
  if (!status?.trim()) return INVESTMENT_STATUS.PENDING;

  const normalized = status.trim().toLowerCase();
  if (normalized === "ativo") return INVESTMENT_STATUS.ACTIVE;
  if (normalized === "em analise") return INVESTMENT_STATUS.PENDING;

  return status.trim();
}

export const INVESTMENT_STATUS = {
  ACTIVE: "Ativo",
  PENDING: "Pendente",
  INACTIVE: "Inativo",
  WITHDRAWN: "Sacado",
  WAITING_WITHDRAW: "Aguardando Saque",
  WAITING_EARNINGS: "Aguardando Rendimento",
  WAITING_REINVEST: "Aguardando Reinvestimento",
} as const;

export type InvestmentStatus =
  (typeof INVESTMENT_STATUS)[keyof typeof INVESTMENT_STATUS];

export function isInvestmentActive(status?: string): boolean {
  return status?.trim().toLowerCase() === "ativo";
}

export function isInvestmentPending(status?: string): boolean {
  return getInvestmentStatusLabel(status) === INVESTMENT_STATUS.PENDING;
}

export function isInvestmentInactive(status?: string): boolean {
  return status?.trim().toLowerCase() === "inativo";
}

export function isInvestmentWithdrawn(status?: string): boolean {
  return status?.trim().toLowerCase() === "sacado";
}

/** Pendentes, inativos e sacados não contam no saldo, nas estatísticas e no total investido. */
export function isInvestmentExcludedFromTotals(status?: string): boolean {
  return (
    isInvestmentPending(status) ||
    isInvestmentInactive(status) ||
    isInvestmentWithdrawn(status)
  );
}

export function isInvestmentWaiting(status?: string): boolean {
  const normalized = status?.trim().toLowerCase() ?? "";
  return normalized.startsWith("aguardando");
}

export function getInvestmentStatusLabel(status?: string): string {
  if (!status?.trim()) return INVESTMENT_STATUS.PENDING;

  const normalized = status.trim().toLowerCase();
  if (normalized === "ativo") return INVESTMENT_STATUS.ACTIVE;
  if (normalized === "inativo") return INVESTMENT_STATUS.INACTIVE;
  if (normalized === "sacado") return INVESTMENT_STATUS.WITHDRAWN;
  if (normalized === "em analise") return INVESTMENT_STATUS.PENDING;
  if (normalized === "aguardando saque") return INVESTMENT_STATUS.WAITING_WITHDRAW;
  if (normalized === "aguardando rendimento") {
    return INVESTMENT_STATUS.WAITING_EARNINGS;
  }
  if (normalized === "aguardando reinvestimento") {
    return INVESTMENT_STATUS.WAITING_REINVEST;
  }

  return status.trim();
}

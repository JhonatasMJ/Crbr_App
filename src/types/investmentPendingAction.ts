export type InvestmentPendingActionType =
  | "withdraw-full"
  | "withdraw-partial"
  | "reinvest";

export type InvestmentPendingAction = {
  type: InvestmentPendingActionType;
  /**
   * Saque total / parcial: valor solicitado.
   * Reinvestimento: novo principal (investimento + rendimento, ex.: 7700).
   */
  amount: number;
  requestedAt: number;
  createdDate: string;
  createdTime: string;
};

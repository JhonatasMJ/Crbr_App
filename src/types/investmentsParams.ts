import type {
  InvestmentAmountHistoryEntry,
  InvestmentReinvestmentEntry,
} from "./investmentAmountHistory";
import type { InvestmentPendingAction } from "./investmentPendingAction";
import type { LegacyInvestmentHistoryEntry } from "./investmentTimeline";

export type InvestmentWithdrawalEntry = {
  amount: string;
  date: string;
  time?: string;
  createdAt?: number;
  type?: string;
  description?: string;
};

export type InvestmentsParams = {
  id?: string;
  amount?: string;
  investmentAmount?: string;
  name?: string;
  investmentName?: string;
  startDate: string;
  endDate: string;
  createdTime?: string;
  createdAt?: number | string;
  createdDate?: string;
  duration: string;
  status?: string;
  userId?: string;
  paymentMethod?: string;
  pixNumber?: string;
  historyEnabled?: boolean;
  partialWithdrawalsCount?: number;
  recused?: boolean;
  amountHistory?: InvestmentAmountHistoryEntry[];
  reinvestments?: InvestmentReinvestmentEntry[];
  pendingAction?: InvestmentPendingAction | null;
  /** Saques totais registrados pelo dashboard, um por saque (mais recente por último). */
  withdrawals?: InvestmentWithdrawalEntry[];
  /** Espelha o saque mais recente; `withdrawn: true` = saldo zerado até novo aporte. */
  withdrawn?: boolean;
  withdrawnAmount?: string;
  withdrawnDate?: string;
  withdrawnTime?: string;
  withdrawnAt?: number;
  /** Formato legado no Realtime Database (objeto com push ids). */
  history?: Record<string, LegacyInvestmentHistoryEntry>;
};
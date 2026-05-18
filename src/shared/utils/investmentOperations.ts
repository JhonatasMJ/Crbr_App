import type { InvestmentsParams } from "@/types/investmentsParams";
import { isInvestmentActive } from "@/shared/constants/investmentStatus";
import {
  getInvestmentBalance,
  getInvestmentProgressInfo,
} from "@/shared/utils/calculateInvestmentIncome";

export function canWithdrawInvestment(investment: InvestmentsParams): boolean {
  if (!isInvestmentActive(investment.status)) return false;

  const progress = getInvestmentProgressInfo({
    startDate: investment.startDate,
    endDate: investment.endDate,
    duration: investment.duration,
    status: investment.status,
  });

  if (!progress) return false;
  return progress.daysRemaining <= 0 && getInvestmentBalance(investment) > 0;
}

export function getWithdrawBlockedMessage(investment: InvestmentsParams): string {
  if (!isInvestmentActive(investment.status)) {
    return "O investimento precisa estar ativo para realizar saques.";
  }

  const progress = getInvestmentProgressInfo({
    startDate: investment.startDate,
    endDate: investment.endDate,
    duration: investment.duration,
    status: investment.status,
  });

  if (!progress) {
    return "Não foi possível validar o período deste investimento.";
  }

  if (progress.daysRemaining > 0) {
    return `Saque disponível em ${progress.daysRemaining} dia(s), após o vencimento.`;
  }

  if (getInvestmentBalance(investment) <= 0) {
    return "Não há saldo disponível para saque.";
  }

  return "";
}

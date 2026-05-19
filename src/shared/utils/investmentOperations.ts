import type { InvestmentsParams } from "@/types/investmentsParams";
import { isInvestmentActive } from "@/shared/constants/investmentStatus";
import {
  formatBrDate,
  getEndDate,
} from "@/shared/utils/investmentDates";
import {
  getInvestmentBalance,
  getInvestmentPrincipal,
  getInvestmentProgressInfo,
} from "@/shared/utils/calculateInvestmentIncome";
import { formatInvestmentAmount } from "@/shared/utils/formatInvestmentAmount";

export function isInvestmentMatured(
  investment: InvestmentsParams,
  today = new Date(),
): boolean {
  if (!isInvestmentActive(investment.status)) return false;

  const progress = getInvestmentProgressInfo(
    {
      startDate: investment.startDate,
      endDate: investment.endDate,
      duration: investment.duration,
      status: investment.status,
    },
    today,
  );

  return progress != null && progress.daysRemaining <= 0;
}

/** Rendimento acumulado (saldo − principal). */
export function getInvestmentEarnings(investment: InvestmentsParams): number {
  if (!isInvestmentActive(investment.status)) return 0;
  return Math.max(
    0,
    getInvestmentBalance(investment) - getInvestmentPrincipal(investment),
  );
}

export function getFullWithdrawMaxAmount(investment: InvestmentsParams): number {
  if (!isInvestmentActive(investment.status)) return 0;
  if (isInvestmentMatured(investment)) {
    return getInvestmentBalance(investment);
  }
  return getInvestmentPrincipal(investment);
}

export function canPerformFullWithdraw(investment: InvestmentsParams): boolean {
  return isInvestmentActive(investment.status) && getFullWithdrawMaxAmount(investment) > 0;
}

export function canPerformPartialWithdraw(investment: InvestmentsParams): boolean {
  return isInvestmentMatured(investment) && getInvestmentEarnings(investment) > 0;
}

export function canReinvestInvestment(investment: InvestmentsParams): boolean {
  return isInvestmentMatured(investment) && getInvestmentBalance(investment) > 0;
}

export function buildRestartedInvestmentDates(
  duration: string,
  fromDate = new Date(),
): { startDate: string; endDate: string } {
  const startDate = formatBrDate(fromDate);
  const endDate = formatBrDate(getEndDate(fromDate, duration));
  return { startDate, endDate };
}

/** @deprecated Use canPerformFullWithdraw — mantido para compatibilidade. */
export function canWithdrawInvestment(investment: InvestmentsParams): boolean {
  return canPerformFullWithdraw(investment);
}

export function getWithdrawBlockedMessage(investment: InvestmentsParams): string {
  if (!isInvestmentActive(investment.status)) {
    return "O investimento precisa estar ativo para realizar saques.";
  }

  if (getFullWithdrawMaxAmount(investment) <= 0) {
    return "Não há saldo disponível para saque.";
  }

  return "";
}

export function getPartialWithdrawBlockedMessage(
  investment: InvestmentsParams,
): string {
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
    return `Saque do rendimento disponível em ${progress.daysRemaining} dia(s), após o vencimento.`;
  }

  if (getInvestmentEarnings(investment) <= 0) {
    return "Não há rendimento disponível para saque.";
  }

  return "";
}

export function getReinvestBlockedMessage(investment: InvestmentsParams): string {
  if (!isInvestmentActive(investment.status)) {
    return "O investimento precisa estar ativo para reinvestir.";
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
    return `Reinvestimento disponível em ${progress.daysRemaining} dia(s), após o vencimento.`;
  }

  if (getInvestmentBalance(investment) <= 0) {
    return "Não há saldo para reinvestir.";
  }

  return "";
}

export function getEarlyFullWithdrawHint(investment: InvestmentsParams): string | null {
  if (!isInvestmentActive(investment.status) || isInvestmentMatured(investment)) {
    return null;
  }

  const principal = getInvestmentPrincipal(investment);
  const earnings = getInvestmentEarnings(investment);

  if (earnings <= 0) return null;

  return `Antes do vencimento, o saque total resgata apenas o principal investido. O rendimento (${formatInvestmentAmount(earnings)}) ficará disponível após o vencimento.`;
}

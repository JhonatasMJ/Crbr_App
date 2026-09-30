import { get, ref, update } from "firebase/database";
import {
  INVESTMENT_STATUS,
  isInvestmentActive,
  isInvestmentInactive,
  isInvestmentWithdrawn,
} from "@/shared/constants/investmentStatus";
import { auth, database } from "@/shared/services/firebase";
import { formatAmountPlain } from "@/shared/utils/formatInvestmentAmount";
import { formatBrDate, formatBrTime } from "@/shared/utils/investmentDates";
import {
  getInvestmentBalance,
  getInvestmentPrincipal,
} from "@/shared/utils/calculateInvestmentIncome";
import { buildRestartedInvestmentDates } from "@/shared/utils/investmentOperations";
import type { InvestmentAmountHistoryEntry } from "@/types/investmentAmountHistory";
import type { InvestmentReinvestmentEntry } from "@/types/investmentAmountHistory";
import type {
  InvestmentsParams,
  InvestmentWithdrawalEntry,
} from "@/types/investmentsParams";

function buildAmountHistoryEntry(
  type: string,
  amount: number,
  previousPlain: string,
  newPlain: string,
  description: string,
): InvestmentAmountHistoryEntry {
  const now = new Date();
  const amountPlain = formatAmountPlain(amount);
  return {
    amount: amountPlain,
    createdAt: now.getTime(),
    createdDate: formatBrDate(now),
    createdTime: formatBrTime(now),
    description,
    newAmount: newPlain,
    previousAmount: previousPlain,
    type,
  };
}

function shouldApplyPendingAction(investment: InvestmentsParams): boolean {
  if (!investment.pendingAction || !investment.id) return false;

  if (investment.pendingAction.type === "withdraw-full") {
    return (
      isInvestmentInactive(investment.status) ||
      isInvestmentWithdrawn(investment.status)
    );
  }

  return isInvestmentActive(investment.status);
}

export async function applyPendingInvestmentActionIfNeeded(
  investment: InvestmentsParams,
): Promise<void> {
  if (!shouldApplyPendingAction(investment)) return;

  const uid = auth.currentUser?.uid;
  if (!uid || !investment.id) return;

  const investmentRef = ref(
    database,
    `users/${uid}/investments/${investment.id}`,
  );
  const snapshot = await get(investmentRef);
  if (!snapshot.exists()) return;

  const fresh = {
    id: investment.id,
    ...(snapshot.val() as Omit<InvestmentsParams, "id">),
  };

  if (!fresh.pendingAction || !shouldApplyPendingAction(fresh)) return;

  const { type, amount } = fresh.pendingAction;
  const history = fresh.amountHistory ?? [];
  const previousPrincipal = getInvestmentPrincipal(fresh);
  const previousPlain = formatAmountPlain(previousPrincipal);

  if (type === "withdraw-full") {
    // Mesmo formato do dashboard: uma linha em `withdrawals` por saque, `withdrawn*`
    // espelhando o mais recente. O valor da cota é mantido (o dashboard exige valor
    // ao editar e usa `withdrawn: true` como saldo zerado até um novo aporte).
    const now = new Date();
    const withdrawnAmount = formatAmountPlain(amount);
    const withdrawnDate = formatBrDate(now);
    const withdrawnTime = formatBrTime(now);
    const withdrawalEntry: InvestmentWithdrawalEntry = {
      amount: withdrawnAmount,
      date: withdrawnDate,
      time: withdrawnTime,
      createdAt: now.getTime(),
      type: "Saque",
      description: "Saque total da cota",
    };

    await update(investmentRef, {
      status: INVESTMENT_STATUS.WITHDRAWN,
      pendingAction: null,
      withdrawn: true,
      withdrawnAmount,
      withdrawnDate,
      withdrawnTime,
      withdrawnAt: now.getTime(),
      withdrawals: [...(fresh.withdrawals ?? []), withdrawalEntry],
    });
    return;
  }

  if (type === "withdraw-partial") {
    const newPlain = formatAmountPlain(previousPrincipal);
    const { startDate, endDate } = buildRestartedInvestmentDates(fresh.duration);

    await update(investmentRef, {
      investmentAmount: `R$ ${newPlain}`,
      startDate,
      endDate,
      pendingAction: null,
      partialWithdrawalsCount: (fresh.partialWithdrawalsCount ?? 0) + 1,
      amountHistory: [
        ...history,
        buildAmountHistoryEntry(
          "Saque parcial",
          amount,
          previousPlain,
          newPlain,
          "Saque do rendimento concluído — investimento reiniciado",
        ),
      ],
    });
    return;
  }

  if (type === "reinvest") {
    const newPrincipal =
      amount > previousPrincipal ? amount : previousPrincipal + amount;
    const reinvestedEarnings = Math.max(0, newPrincipal - previousPrincipal);
    const newPlain = formatAmountPlain(newPrincipal);
    const now = new Date();
    const { startDate, endDate } = buildRestartedInvestmentDates(
      fresh.duration,
      now,
    );
    const reinvestment: InvestmentReinvestmentEntry = {
      amount: formatAmountPlain(reinvestedEarnings),
      createdAt: now.getTime(),
      createdDate: formatBrDate(now),
      createdTime: formatBrTime(now),
    };

    await update(investmentRef, {
      investmentAmount: `R$ ${newPlain}`,
      startDate,
      endDate,
      pendingAction: null,
      reinvestments: [...(fresh.reinvestments ?? []), reinvestment],
      amountHistory: [
        ...history,
        buildAmountHistoryEntry(
          "Reinvestimento",
          reinvestedEarnings,
          previousPlain,
          newPlain,
          "Reinvestimento concluído — novo ciclo de 4 meses",
        ),
      ],
    });
  }
}

import { get, ref, update } from "firebase/database";
import {
  INVESTMENT_STATUS,
  isInvestmentActive,
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
import type { InvestmentsParams } from "@/types/investmentsParams";

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
    return investment.status === INVESTMENT_STATUS.INACTIVE;
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
    await update(investmentRef, {
      investmentAmount: "R$ 0,00",
      pendingAction: null,
      amountHistory: [
        ...history,
        buildAmountHistoryEntry(
          "Saque total",
          amount,
          previousPlain,
          "0,00",
          "Saque total concluído",
        ),
      ],
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

import { useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useBottomSheetContext } from "@/context/bottomShet.context";
import { useInvestments } from "@/context/investments.context";
import { useSnackBarContext } from "@/context/snackbar.context";
import {
  getInvestmentBalance,
  getInvestmentPrincipal,
} from "@/shared/utils/calculateInvestmentIncome";
import { formatInvestmentAmount } from "@/shared/utils/formatInvestmentAmount";
import {
  canPerformFullWithdraw,
  canPerformPartialWithdraw,
  canReinvestInvestment,
  getFullWithdrawMaxAmount,
  getInvestmentEarnings,
  getPartialWithdrawBlockedMessage,
  getReinvestBlockedMessage,
  getWithdrawBlockedMessage,
  isInvestmentMatured,
} from "@/shared/utils/investmentOperations";
import type { InvestmentsParams } from "@/types/investmentsParams";

export type InvestmentManageAction = "withdraw-full" | "withdraw-partial" | "reinvest";

type InvestmentActionSheetContentProps = {
  investment: InvestmentsParams;
  action: InvestmentManageAction;
};

const ACTION_COPY: Record<
  InvestmentManageAction,
  { title: string; confirmLabel: string; description: string }
> = {
  "withdraw-full": {
    title: "Sacar total",
    confirmLabel: "Confirmar saque total",
    description:
      "Resgata o valor disponível: antes do vencimento, apenas o principal; após o vencimento, principal + rendimento.",
  },
  "withdraw-partial": {
    title: "Sacar rendimento",
    confirmLabel: "Confirmar saque do rendimento",
    description:
      "Resgata apenas o rendimento acumulado. O principal permanece e o investimento recomeça por mais 4 meses.",
  },
  reinvest: {
    title: "Reinvestir",
    confirmLabel: "Confirmar reinvestimento",
    description:
      "O rendimento é incorporado ao principal e o investimento recomeça por mais 4 meses a partir de hoje.",
  },
};

export function InvestmentActionSheetContent({
  investment,
  action,
}: InvestmentActionSheetContentProps) {
  const {
    withdrawInvestmentFull,
    withdrawInvestmentPartial,
    reinvestInInvestment,
  } = useInvestments();
  const { closeBottomSheet } = useBottomSheetContext();
  const { notify } = useSnackBarContext();
  const [submitting, setSubmitting] = useState(false);

  const balance = getInvestmentBalance(investment);
  const principal = getInvestmentPrincipal(investment);
  const earnings = getInvestmentEarnings(investment);
  const matured = isInvestmentMatured(investment);
  const copy = ACTION_COPY[action];

  const actionAmount =
    action === "withdraw-full"
      ? getFullWithdrawMaxAmount(investment)
      : action === "withdraw-partial"
        ? earnings
        : balance;

  const canConfirm =
    action === "withdraw-full"
      ? canPerformFullWithdraw(investment)
      : action === "withdraw-partial"
        ? canPerformPartialWithdraw(investment)
        : canReinvestInvestment(investment);

  const blockedMessage =
    action === "withdraw-full"
      ? getWithdrawBlockedMessage(investment)
      : action === "withdraw-partial"
        ? getPartialWithdrawBlockedMessage(investment)
        : getReinvestBlockedMessage(investment);

  async function onConfirm() {
    if (!investment.id) return;

    try {
      setSubmitting(true);

      if (!canConfirm) {
        notify({ message: blockedMessage, messageType: "ERROR" });
        return;
      }

      if (action === "withdraw-full") {
        await withdrawInvestmentFull(investment.id);
      } else if (action === "withdraw-partial") {
        await withdrawInvestmentPartial(investment.id);
      } else {
        await reinvestInInvestment(investment.id);
      }

      closeBottomSheet();
    } catch {
      /* notify no context */
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View className="gap-6 px-6 pb-10 pt-2">
      <View>
        <Text className="font-sans-bold text-2xl text-white">{copy.title}</Text>
        <Text className="mt-2 font-sans text-sm text-zinc-400">
          {copy.description}
        </Text>
      </View>

      <View className="rounded-md border border-zinc-800 bg-zinc-900/50 p-4">
        <Text className="font-sans-semibold text-sm text-zinc-400">Cota</Text>
        <Text className="mt-1 font-sans-bold text-lg text-white">
          {investment.investmentName || investment.name}
        </Text>

        <View className="mt-3 flex-row justify-between border-t border-zinc-800 pt-3">
          <Text className="font-sans text-sm text-zinc-400">Saldo atual</Text>
          <Text className="font-sans-bold text-base text-primary">
            {formatInvestmentAmount(balance)}
          </Text>
        </View>

        <View className="mt-2 flex-row justify-between">
          <Text className="font-sans text-sm text-zinc-400">Principal</Text>
          <Text className="font-sans-semibold text-sm text-white">
            {formatInvestmentAmount(principal)}
          </Text>
        </View>

        {matured && earnings > 0 ? (
          <View className="mt-2 flex-row justify-between">
            <Text className="font-sans text-sm text-zinc-400">Rendimento</Text>
            <Text className="font-sans-semibold text-sm text-white">
              {formatInvestmentAmount(earnings)}
            </Text>
          </View>
        ) : null}

        <View className="mt-3 flex-row justify-between border-t border-zinc-800 pt-3">
          <Text className="font-sans-semibold text-sm text-zinc-400">
            Valor desta operação
          </Text>
          <Text className="font-sans-bold text-base text-primary">
            {formatInvestmentAmount(actionAmount)}
          </Text>
        </View>
      </View>

      <Button
        className="bg-primary"
        size="xl"
        disabled={submitting || !canConfirm}
        onPress={onConfirm}
      >
        <Text className="font-sans-bold text-lg text-black">
          {submitting ? "Processando..." : copy.confirmLabel}
        </Text>
      </Button>
    </View>
  );
}

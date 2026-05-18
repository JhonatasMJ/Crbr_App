import { useMemo, useState } from "react";
import { View } from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type { Resolver } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { CurrencyInputLabel } from "@/components/CurrencyInputLabel";
import { useBottomSheetContext } from "@/context/bottomShet.context";
import { useInvestments } from "@/context/investments.context";
import { useSnackBarContext } from "@/context/snackbar.context";
import {
  createInvestmentActionAmountSchema,
  type InvestmentActionAmountValues,
} from "@/shared/schemas/investmentAction";
import {
  getInvestmentBalance,
  getInvestmentPrincipal,
} from "@/shared/utils/calculateInvestmentIncome";
import { formatInvestmentAmount } from "@/shared/utils/formatInvestmentAmount";
import {
  canWithdrawInvestment,
  getWithdrawBlockedMessage,
} from "@/shared/utils/investmentOperations";
import type { InvestmentsParams } from "@/types/investmentsParams";
import { isInvestmentActive } from "@/shared/constants/investmentStatus";

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
    description: "Todo o saldo disponível será sacado deste investimento.",
  },
  "withdraw-partial": {
    title: "Sacar parcial",
    confirmLabel: "Confirmar saque parcial",
    description: "Informe o valor que deseja sacar parcialmente.",
  },
  reinvest: {
    title: "Reinvestir",
    confirmLabel: "Confirmar reinvestimento",
    description: "O valor será adicionado ao principal deste investimento.",
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
  const copy = ACTION_COPY[action];
  const needsAmount = action !== "withdraw-full";
  const maxAmount = action === "reinvest" ? 150_000 : balance;

  const schema = useMemo(
    () => createInvestmentActionAmountSchema(maxAmount),
    [maxAmount],
  );

  const { control, handleSubmit } = useForm<InvestmentActionAmountValues>({
    defaultValues: { amount: null },
    resolver: yupResolver(schema) as Resolver<InvestmentActionAmountValues>,
  });

  const withdrawBlockedMessage = getWithdrawBlockedMessage(investment);
  const canWithdraw = canWithdrawInvestment(investment);
  const canReinvest = isInvestmentActive(investment.status);

  async function onConfirm(data?: InvestmentActionAmountValues) {
    if (!investment.id) return;

    try {
      setSubmitting(true);

      if (action === "withdraw-full") {
        if (!canWithdraw) {
          notify({ message: withdrawBlockedMessage, messageType: "ERROR" });
          return;
        }
        await withdrawInvestmentFull(investment.id);
      }

      if (action === "withdraw-partial") {
        if (!canWithdraw) {
          notify({ message: withdrawBlockedMessage, messageType: "ERROR" });
          return;
        }
        if (data?.amount == null) return;
        await withdrawInvestmentPartial(investment.id, data.amount);
      }

      if (action === "reinvest") {
        if (!canReinvest) {
          notify({
            message: "O investimento precisa estar ativo para reinvestir.",
            messageType: "ERROR",
          });
          return;
        }
        if (data?.amount == null) return;
        await reinvestInInvestment(investment.id, data.amount);
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
        {action === "withdraw-full" ? (
          <View className="mt-2 flex-row justify-between">
            <Text className="font-sans text-sm text-zinc-400">Principal</Text>
            <Text className="font-sans-semibold text-sm text-white">
              {formatInvestmentAmount(principal)}
            </Text>
          </View>
        ) : null}
      </View>

      {(action === "withdraw-full" || action === "withdraw-partial") &&
      !canWithdraw ? (
        <Text className="font-sans-medium text-sm text-red-400">
          {withdrawBlockedMessage}
        </Text>
      ) : null}

      {action === "reinvest" && !canReinvest ? (
        <Text className="font-sans-medium text-sm text-red-400">
          O investimento precisa estar ativo para reinvestir.
        </Text>
      ) : null}

      {needsAmount ? (
        <CurrencyInputLabel
          control={control}
          name="amount"
          label={action === "reinvest" ? "Valor do reinvestimento" : "Valor do saque"}
        />
      ) : null}

      <Button
        className="bg-primary"
        size="xl"
        disabled={
          submitting ||
          (action === "withdraw-full" && !canWithdraw) ||
          (action === "withdraw-partial" && !canWithdraw) ||
          (action === "reinvest" && !canReinvest)
        }
        onPress={
          needsAmount ? handleSubmit((data) => onConfirm(data)) : () => onConfirm()
        }
      >
        <Text className="font-sans-bold text-lg text-black">
          {submitting ? "Processando..." : copy.confirmLabel}
        </Text>
      </Button>
    </View>
  );
}

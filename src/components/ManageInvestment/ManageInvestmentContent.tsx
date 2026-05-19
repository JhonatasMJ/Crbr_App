import { useCallback } from "react";
import { ScrollView, View } from "react-native";
import { HandCoins, RefreshCw, Wallet } from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { useBottomSheetContext } from "@/context/bottomShet.context";

import {
  getInvestmentBalance,
  getInvestmentPrincipal,
} from "@/shared/utils/calculateInvestmentIncome";

import { formatInvestmentAmount } from "@/shared/utils/formatInvestmentAmount";

import {
  canWithdrawInvestment,
  getWithdrawBlockedMessage,
} from "@/shared/utils/investmentOperations";

import { getInvestmentStatusLabel } from "@/shared/constants/investmentStatus";

import type { InvestmentsParams } from "@/types/investmentsParams";

import { ManageInvestmentOptionRow } from "@/components/ManageInvestment/ManageInvestmentOptionRow";

import {
  InvestmentActionSheetContent,
  type InvestmentManageAction,
} from "@/components/ManageInvestment/InvestmentActionSheetContent";

type ManageInvestmentContentProps = {
  investment: InvestmentsParams;
};

export function ManageInvestmentContent({
  investment,
}: ManageInvestmentContentProps) {
  const { openBottomSheet } = useBottomSheetContext();

  const balance = getInvestmentBalance(investment);
  const principal = getInvestmentPrincipal(investment);

  const canWithdraw = canWithdrawInvestment(investment);
  const withdrawMessage = getWithdrawBlockedMessage(investment);

  const openAction = useCallback(
    (action: InvestmentManageAction) => {
      openBottomSheet(
        <InvestmentActionSheetContent
          key={`${investment.id}-${action}`}
          investment={investment}
          action={action}
        />,
        1,
      );
    },
    [investment, openBottomSheet],
  );

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-6 px-6 pb-10 pt-4"
      showsVerticalScrollIndicator={false}
    >
  <View className="gap-3">
  <View className="flex-row gap-3">
    <View className="flex-1 rounded-md bg-secondary p-4">
      <Text className="font-sans-medium text-xs text-zinc-400">
        Cota
      </Text>

      <Text
        numberOfLines={2}
        className="mt-2 font-sans-bold text-lg text-white"
      >
        {investment.investmentName || investment.name}
      </Text>
    </View>

    <View className="flex-1 rounded-md bg-secondary p-4">
      <Text className="font-sans-medium text-xs text-zinc-400">
        Status
      </Text>

      <Text className="mt-2 font-sans-bold text-base text-white">
        {getInvestmentStatusLabel(investment.status)}
      </Text>
    </View>
  </View>

  {/* Linha 2 */}
  <View className="flex-row gap-3">
    <View className="flex-1 rounded-md bg-secondary p-4">
      <Text className="font-sans-medium text-xs text-zinc-400">
        Saldo
      </Text>

      <Text className="mt-2 font-sans-bold text-lg text-primary">
        {formatInvestmentAmount(balance)}
      </Text>
    </View>

    <View className="flex-1 rounded-md bg-secondary p-4">
      <Text className="font-sans-medium text-xs text-zinc-400">
        Principal
      </Text>

      <Text className="mt-2 font-sans-bold text-lg text-white">
        {formatInvestmentAmount(principal)}
      </Text>
    </View>
  </View>
</View>

      {!canWithdraw && withdrawMessage ? (
        <View className="rounded-md bg-zinc-900/60 px-4 py-3">
          <Text className="font-sans-medium text-sm text-zinc-400">
            {withdrawMessage}
          </Text>
        </View>
      ) : null}


      <View className="gap-3">
        <Text className="font-sans-bold text-lg text-white">
          O que deseja fazer?
        </Text>

        <ManageInvestmentOptionRow
          title="Sacar total"
          description="Resgatar todo o saldo disponível desta cota"
          icon={Wallet}
          disabled={!canWithdraw}
          onPress={() => openAction("withdraw-full")}
        />

        <ManageInvestmentOptionRow
          title="Sacar parcial"
          description="Resgatar apenas uma parte do saldo"
          icon={HandCoins}
          disabled={!canWithdraw}
          onPress={() => openAction("withdraw-partial")}
        />

        <ManageInvestmentOptionRow
          title="Reinvestir"
          description="Adicionar um novo aporte nesta mesma cota"
          icon={RefreshCw}
          onPress={() => openAction("reinvest")}
        />
      </View>
    </ScrollView>
  );
}

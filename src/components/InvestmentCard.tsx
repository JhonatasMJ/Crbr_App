import { formatInvestmentAmount } from "@/shared/utils/formatInvestmentAmount";
import {
  getInvestmentProgressInfo,
  type InvestmentWithdrawalInfo,
} from "@/shared/utils/calculateInvestmentIncome";
import {
  getInvestmentStatusLabel,
  isInvestmentActive,
  isInvestmentWithdrawn,
} from "@/shared/constants/investmentStatus";
import { Pressable, Text, View } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Progress } from "./ui/progress";
import { INVESTMENT_CARD_STYLE, InvestmentCardVariant } from "@/shared/strategies/investment-card";
import { RightAction } from "./RightAction";

type InvestmentCardProps = {
  investmentId: string;
  selected?: boolean;
  onPress?: () => void;
  name: string;
  amount: number;
  status?: string;
  startDate: string;
  endDate: string;
  duration: string;
  /** Só para cotas sacadas: valor e data do saque total. */
  withdrawal?: InvestmentWithdrawalInfo | null;
};

function remainingLabel(days: number): string {
  if (days <= 0) return "Você já pode sacar";
  if (days === 1) return "1 dia restante";
  return `${days} dias restantes`;
}

export function InvestmentCard({
  investmentId,
  selected = false,
  onPress,
  name,
  amount,
  status,
  startDate,
  endDate,
  duration,
  withdrawal,
}: InvestmentCardProps) {
  const active = isInvestmentActive(status);
  const withdrawn = isInvestmentWithdrawn(status);
  const statusLabel = getInvestmentStatusLabel(status);
  const progress = getInvestmentProgressInfo({
    startDate,
    endDate,
    duration,
    status,
  });
  const variant: InvestmentCardVariant = selected ? "selected" : "default";
  const style = INVESTMENT_CARD_STYLE[variant];

  return (
    <View className="mt-4 w-full px-6">
      <Swipeable
        activeOffsetX={[-24, 24]}
        failOffsetY={[-12, 12]}
        containerStyle={{
          overflow: "visible",
          width: "100%",
        }}
        overshootRight={false}
        renderRightActions={() => (
          <RightAction investmentId={investmentId} />
        )}
      >
        <Pressable onPress={onPress}>
          <View className={`rounded-md p-4 ${style.containerBg}`}>
            <View className="flex-row items-start justify-between gap-2">
              <Text
                className={`flex-1 font-sans-semibold text-lg ${style.titleText}`}
              >
                {name}
              </Text>
              <Text
                className={`font-sans-semibold text-sm ${selected ? "text-secondary" : "text-primary"}`}
              >
                {statusLabel}
              </Text>
            </View>
            {withdrawn ? (
              <View className="mt-1">
                <Text className={`font-sans-medium text-sm ${style.helperText}`}>
                  Valor sacado
                </Text>
                <Text className={`font-sans-bold text-2xl ${style.helperText}`}>
                  {withdrawal ? formatInvestmentAmount(withdrawal.amount) : "—"}
                </Text>
              </View>
            ) : (
              <Text className={`font-sans-bold text-2xl ${style.amountText}`}>
                {formatInvestmentAmount(amount)}
              </Text>
            )}

            {withdrawn ? (
              <Text className={`mt-2 font-sans-medium text-sm ${style.helperText}`}>
                {withdrawal?.date
                  ? `Saque concluído em ${withdrawal.date}`
                  : "Saque concluído"}
              </Text>
            ) : !active ? (
              <Text className={`mt-2 font-sans-medium text-sm ${style.helperText}`}>
                Rendimento inicia quando o status for Ativo
              </Text>
            ) : null}

            {progress ? (
              <View className="mt-3">
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className={`font-sans-medium text-sm ${style.helperText}`}>
                    Dias Restantes
                  </Text>
                  <Text className={`font-sans-semibold text-sm ${style.remainingText}`}>
                    {remainingLabel(progress.daysRemaining)}
                  </Text>
                </View>
                <Progress
                  value={progress.progressPercent}
                  indicatorClassName={style.progressIndicator}
                  className={style.progressTrack}
                />
              </View>
            ) : null}
          </View>
        </Pressable>
      </Swipeable>
    </View>
  );
}

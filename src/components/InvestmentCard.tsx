import { formatInvestmentAmount } from "@/shared/utils/formatInvestmentAmount";
import { getInvestmentProgressInfo } from "@/shared/utils/calculateInvestmentIncome";
import { Pressable, Text, View } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Progress } from "./ui/progress";
import { INVESTMENT_CARD_STYLE, InvestmentCardVariant } from "@/shared/strategies/investment-card";

type InvestmentCardProps = {
  selected?: boolean;
  onPress?: () => void;
  name: string;
  amount: number;
  startDate: string;
  endDate: string;
  duration: string;
};

function remainingLabel(days: number): string {
  if (days <= 0) return "Você já pode sacar";
  if (days === 1) return "1 dia restante";
  return `${days} dias restantes`;
}

export function InvestmentCard({
  selected = false,
  onPress,
  name,
  amount,
  startDate,
  endDate,
  duration,
}: InvestmentCardProps) {
  const progress = getInvestmentProgressInfo({ startDate, endDate, duration });
  const variant: InvestmentCardVariant = selected ? "selected" : "default";
  const style = INVESTMENT_CARD_STYLE[variant];

  return (
    <Swipeable
      containerStyle={{
        overflow: "visible",
        width: "100%",
        marginTop: 16,
        paddingHorizontal: 20,
      }}
      overshootRight={false}
    >
      <Pressable onPress={onPress}>
        <View className={`rounded-md p-4 ${style.containerBg}`}>
          <Text className={`font-sans-semibold text-lg ${style.titleText}`}>
            {name}
          </Text>
          <Text className={`font-sans-bold text-2xl ${style.amountText}`}>
            {formatInvestmentAmount(amount)}
          </Text>

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
  );
}

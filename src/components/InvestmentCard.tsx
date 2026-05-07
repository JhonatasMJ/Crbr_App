import { formatInvestmentAmount } from "@/shared/utils/formatInvestmentAmount";
import { getInvestmentProgressInfo } from "@/shared/utils/calculateInvestmentIncome";
import { Text, View } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Progress } from "./ui/progress";

type InvestmentCardProps = {
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
  name,
  amount,
  startDate,
  endDate,
  duration,
}: InvestmentCardProps) {
  const progress = getInvestmentProgressInfo({ startDate, endDate, duration });

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
      <View className="w-full rounded-md bg-primary p-4">
        <Text className="font-sans-semibold text-lg text-secondary">{name}</Text>
        <Text className="font-sans-bold text-2xl text-secondary">
          {formatInvestmentAmount(amount)}
        </Text>

        {progress ? (
          <View className="mt-3">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-sans-medium text-sm text-secondary/80">
                Dias Restantes
              </Text>
              <Text className="font-sans-semibold text-sm text-secondary">
                {remainingLabel(progress.daysRemaining)}
              </Text>
            </View>
              <Progress value={progress.progressPercent} />
          </View>
        ) : null}
      </View>
    </Swipeable>
  );
}

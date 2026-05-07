import { formatInvestmentAmount } from "@/shared/utils/formatInvestmentAmount";
import { getInvestmentProgressInfo } from "@/shared/utils/calculateInvestmentIncome";
import { Pressable, Text, View } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import clsx from "clsx";
import { Progress } from "./ui/progress";

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
        <View
          className={clsx(
            "rounded-md p-4",
            selected ? "bg-primary" : "bg-secondary",
          )}
        >
          <Text
            className={clsx(
              "font-sans-semibold text-lg",
              selected ? "text-secondary" : "text-white",
            )}
          >
            {name}
          </Text>
          <Text
            className={clsx(
              "font-sans-bold text-2xl",
              selected ? "text-secondary" : "text-white",
            )}
          >
            {formatInvestmentAmount(amount)}
          </Text>

          {progress ? (
            <View className="mt-3">
              <View className="mb-2 flex-row items-center justify-between">
                <Text
                  className={clsx(
                    "font-sans-medium text-sm",
                    selected ? "text-secondary/80" : "text-white/80",
                  )}
                >
                  Dias Restantes
                </Text>
                <Text
                  className={clsx(
                    "font-sans-semibold text-sm",
                    selected ? "text-secondary" : "text-white",
                  )}
                >
                  {remainingLabel(progress.daysRemaining)}
                </Text>
              </View>
              <Progress
                value={progress.progressPercent}
                indicatorClassName={selected ? "bg-secondary" : "bg-primary"}
                className={selected ? "bg-secondary/25" : "bg-primary/25"}
              />
            </View>
          ) : null}
        </View>
      </Pressable>
    </Swipeable>
  );
}

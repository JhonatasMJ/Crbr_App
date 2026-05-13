import { maskCPF } from "@/shared/utils/masks/cpfMask";
import { Pressable, Text, View, StyleSheet } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import type { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import { Progress } from "./ui/progress";
import { RightActionBeneficiary } from "./RightActionBeneficiary";
import { LeftActionBeneficiary } from "./LeftActionBeneficiary";

/** Largura fixa — o Swipeable mede o painel; evitar `flex-1` nas ações. */
const BENEFICIARY_SWIPE_ACTION_W = 80;

type BeneficiaryCardProps = {
  beneficiaryId: string;
  onPress?: () => void;
  /** Edição: arrastar o card para a direita (painel à esquerda) */
  onEditPress: () => void;
  name: string;
  cpf: string;
  percentage: number;
};

export function BeneficiaryCard({
  beneficiaryId,
  onPress,
  onEditPress,
  name,
  cpf,
  percentage,
}: BeneficiaryCardProps) {
  const progressValue = Math.min(100, Math.max(0, Number(percentage) || 0));

  return (
    <View className="w-full">
      <Swipeable
        containerStyle={styles.swipeContainer}
        overshootRight={false}
        overshootLeft={false}
        renderLeftActions={(
          _progress,
          _translation,
          swipeableMethods: SwipeableMethods,
        ) => (
          <View
            style={{
              width: BENEFICIARY_SWIPE_ACTION_W,
              height: "100%",
            }}
          >
            <LeftActionBeneficiary
              onEditPress={() => {
                swipeableMethods.close();
                onEditPress();
              }}
            />
          </View>
        )}
        renderRightActions={() => (
          <View
            style={{
              width: BENEFICIARY_SWIPE_ACTION_W,
              height: "100%",
            }}
          >
            <RightActionBeneficiary beneficiaryId={beneficiaryId} />
          </View>
        )}
      >
        <Pressable onPress={onPress} className="active:opacity-90">
          <View className="rounded-md  bg-secondary p-4">
            <Text className="font-sans-semibold text-lg leading-tight text-white">
              {name}
            </Text>

            <Text className="mt-2 font-sans-medium text-xs uppercase tracking-wide text-primary">
              CPF
            </Text>
            <Text className="mt-0.5 font-sans-semibold text-base text-white">
              {maskCPF(cpf)}
            </Text>

            <View className="mt-3 border-t border-white/10 pt-3">
              <View className="mb-2 flex-row items-center justify-between gap-2">
                <Text className="shrink font-sans-medium text-sm text-white/80">
                  Participação no repasse
                </Text>
                <View className="rounded-sm bg-primary/90 px-2.5 py-0.5">
                  <Text className="font-sans-bold text-xs text-secondary">
                    {progressValue}%
                  </Text>
                </View>
              </View>
              <Progress
                value={progressValue}
                indicatorClassName="bg-primary"
                className="bg-primary/25"
              />
            </View>
          </View>
        </Pressable>
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    width: "100%",
    overflow: "hidden",
  },
});

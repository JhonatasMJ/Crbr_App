import { View } from "react-native";
import { Pencil } from "lucide-react-native";
import { RectButton } from "react-native-gesture-handler";

type LeftActionBeneficiaryProps = {
  onEditPress: () => void;
};

export function LeftActionBeneficiary({ onEditPress }: LeftActionBeneficiaryProps) {
  return (
    <RectButton
      style={{ width: 80, height: "100%" }}
      onPress={onEditPress}
    >
      <View className="h-full w-full items-center justify-center rounded-l-md bg-primary">
        <Pencil size={30} color="black" />
      </View>
    </RectButton>
  );
}

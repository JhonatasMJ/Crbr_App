import { Pressable } from "react-native";
import { Pencil } from "lucide-react-native";

type LeftActionBeneficiaryProps = {
  onEditPress: () => void;
};

export function LeftActionBeneficiary({ onEditPress }: LeftActionBeneficiaryProps) {
  return (
    <Pressable
      onPress={onEditPress}
      className="h-full w-[80] items-center justify-center rounded-l-md bg-primary"
    >
      <Pencil size={30} color="black" />
    </Pressable>
  );
}

import { Pressable, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { ChevronRight } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { colors } from "@/themes/colors";

type ManageInvestmentOptionRowProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  disabled?: boolean;
  onPress: () => void;
};

export function ManageInvestmentOptionRow({
  title,
  description,
  icon,
  disabled = false,
  onPress,
}: ManageInvestmentOptionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center gap-4 rounded-md border border-zinc-800 bg-secondary p-4 ${
        disabled ? "opacity-50" : "active:opacity-90"
      }`}
    >
      <View className="h-11 w-11 items-center justify-center rounded-md bg-primary/15">
        <Icon as={icon} size={22} color={colors.primary} strokeWidth={2} />
      </View>
      <View className="flex-1">
        <Text className="font-sans-bold text-base text-white">{title}</Text>
        <Text className="mt-1 font-sans text-sm text-zinc-400">{description}</Text>
      </View>
      <ChevronRight size={20} color={colors.primary} />
    </Pressable>
  );
}

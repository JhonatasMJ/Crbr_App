import { Pressable, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { ChevronRight, Lock } from "lucide-react-native";

import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { colors } from "@/themes/colors";
import clsx from "clsx";

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
      className={clsx(
        "rounded-md bg-secondary",
        disabled ? "bg-secondary/62" : "active:opacity-100",
      )}
    >
      <View className="flex-row items-center p-4">
        <View className="h-14 w-14 items-center justify-center rounded-md bg-primary/10">
          {disabled ? (
            <Lock size={18} color={colors.primary} />
          ) : (
            <Icon as={icon} size={24} color={colors.primary} strokeWidth={2} />
          )}
        </View>

        <View className="ml-4 flex-1">
          <Text className="font-sans-semibold text-base text-white">
            {title}
          </Text>

          <Text className="mt-1 font-sans text-sm leading-5 text-zinc-400">
            {description}
          </Text>
        </View>

        <View className="ml-3 h-10 w-10 items-center justify-center rounded-md bg-zinc-800/70">
          {disabled ? (
            <Lock size={18} color={colors.primary} />
          ) : (
            <ChevronRight size={18} color={colors.primary} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

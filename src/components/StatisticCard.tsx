import { LucideIcon } from "lucide-react-native";
import { Text, View } from "react-native";
import { Icon } from "@/components/ui/icon";

export type StatisticCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
};


export function StatisticCard({ title, value, icon }: StatisticCardProps) {
  return (
    <View className="w-[180] shrink-0 rounded-md bg-primary-foreground py-3 px-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-sans-semibold text-base text-white">
          {title}
          <Text className="font-sans-medium text-sm text-primary">.</Text>
        </Text>
        <Icon as={icon} size={22} color="#FFBF00" strokeWidth={1.8} />
      </View>
      <Text className="mt-1 font-sans-bold text-xl text-white">{value}</Text>
    </View>
  );
}

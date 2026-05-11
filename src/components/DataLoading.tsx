import { ActivityIndicator, View } from "react-native";
import { Text } from "@/components/ui/text";

type DataLoadingProps = {
  message?: string;
};

export function DataLoading({
  message = "Carregando dados…",
}: DataLoadingProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
      <ActivityIndicator size="large" className="text-primary" />
      <Text className="text-center font-sans-semibold text-lg text-white">
        {message}
      </Text>
    </View>
  );
}

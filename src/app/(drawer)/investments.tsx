import { Text } from "@/components/ui/text";
import { colors } from "@/themes/colors";
import { router, type Href } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function InvestmentsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <View
        className="flex-row items-center gap-2 border-b border-border bg-background px-4 pb-3"
        style={{ paddingTop: Math.max(insets.top, 12) }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={12}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/(drawer)" as Href)
          }
          className="rounded-md p-2"
        >
          <ChevronLeft size={28} color={colors.foreground} />
        </Pressable>
        <Text className="font-sans-bold text-xl text-white">Investir</Text>
      </View>
    </View>
  );
}

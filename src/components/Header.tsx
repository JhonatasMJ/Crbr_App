import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { HeaderProps } from "../types/header";
import Logo from "@/assets/logoSvg.svg";
import { Button } from "./ui/button";
import { ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export function Header({ span, title, logo = true }: HeaderProps) {
  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  return (
    <SafeAreaView edges={logo ? [] : ["top"]} className="bg-primary">
      <View
        className={`bg-primary rounded-b-xl px-6 ${logo ? "h-48 pt-2 pb-6" : "pt-2 pb-5"}`}
      >
        <View className="relative min-h-10 flex-row items-center justify-center">
          <View className="absolute left-0 z-10">
            <Button onPress={handleBack} size="icon" className="bg-secondary">
              <ChevronLeft size={20} color="#fff" />
            </Button>
          </View>
          {logo ? <Logo width={60} /> : null}
        </View>
        <View className={logo ? "mt-6" : "mt-5"}>
          <Text className="text-secondary font-sans-semibold">{span}</Text>
          <Text className="text-secondary font-sans-bold text-3xl">{title}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

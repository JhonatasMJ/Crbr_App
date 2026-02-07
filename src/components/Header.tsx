import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { HeaderProps } from "../types/header";
import Logo from "@/assets/logoSvg.svg";
import { Button } from "./ui/button";
import { ChevronLeft } from "lucide-react-native";

export function Header({ span, title }: HeaderProps) {
  return (
    <View className="bg-primary h-48 rounded-b-xl p-6">
      <View className="relative flex-row items-center justify-center">
        <View className="absolute left-0">
          <Button size="icon" className="bg-secondary">
            <ChevronLeft size={20} color="#fff" />
          </Button>
        </View>
        <Logo width={60} />
      </View>
      <View className="mt-6">
        <Text className="text-secondary font-sans-semibold">{span}</Text>
        <Text className="text-secondary font-sans-bold text-3xl">{title}</Text>
      </View>
    </View>
  );
}

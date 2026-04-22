import { View } from "react-native";
import { HomeHeader } from "@/components/HomeHeader";

export default function Home() {
  return (
    <View className="flex-1 bg-background">
      <HomeHeader />
    </View>
  );
}

import { ScrollView, Text, View } from "react-native";
import { HomeHeader } from "@/components/HomeHeader";
import { ServiceCard } from "@/components/ServiceCard";

export default function Home() {
  return (
    <View className="flex-1 bg-background">
      <HomeHeader />
      <View className="px-4 mt-6">
        <Text className="font-sans-semibold text-xl text-white">Outros Serviços<Text className="text-primary">.</Text> </Text>
        <Text className="font-sans-semibold text-md text-zinc-500">Explore nossos serviços financeiros</Text>
      </View>
      <ServiceCard />
    </View>
  );
}

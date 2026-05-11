import { FlatList, Text, View } from "react-native";
import { HomeHeader } from "@/components/HomeHeader";
import { ServiceCard } from "@/components/ServiceCard";
import { InvestmentCard } from "@/components/InvestmentCard";
import { DataLoading } from "@/components/DataLoading";
import { useInvestments } from "@/context/investments.context";
import { investmentToCardItem } from "@/shared/utils/calculateInvestmentIncome";

function HomeListHeader() {
  return (
    <>
      <HomeHeader />
      <View className="mt-6 px-6">
        <Text className="font-sans-semibold text-xl text-white">
          Outros Serviços<Text className="text-primary">.</Text>{" "}
        </Text>
        <Text className="font-sans-semibold text-md text-zinc-500">
          Explore nossos serviços financeiros
        </Text>
      </View>
      <ServiceCard />
      <View className="mt-6 px-6">
        <Text className="font-sans-semibold text-xl text-white">
          Meus Investimentos<Text className="text-primary">.</Text>{" "}
        </Text>
        <Text className="font-sans-semibold text-md text-zinc-500">
          Consulte seus investimentos
        </Text>
      </View>
      <View className="h-2" />
    </>
  );
}

function InvestmentRowSeparator() {
  return <View className="h-3" />;
}

export default function Home() {
  const { investments, selectedInvestment, selectInvestment, loading } =
    useInvestments();

  if (loading) {
    return <DataLoading />;
  }

  return (
    <FlatList
      className="flex-1 bg-background"
      data={investments}
      keyExtractor={(item) => item.id ?? ""}
      ListHeaderComponent={<HomeListHeader />}
      renderItem={({ item }) => {
        const card = investmentToCardItem(item);
        return (
          <InvestmentCard
            selected={selectedInvestment?.id === item.id}
            onPress={() => selectInvestment(item.id)}
            name={card.name}
            amount={card.amount}
            startDate={item.startDate}
            endDate={item.endDate}
            duration={item.duration}
          />
        );
      }}
      ItemSeparatorComponent={InvestmentRowSeparator}
      ListFooterComponent={<View className="h-8" />}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
}

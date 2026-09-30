import { useEffect } from "react";
import { FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, type Href } from "expo-router";
import { useAuth } from "@/context/auth.context";
import { isAdminEmail } from "@/shared/constants/admin";
import { HomeHeader } from "@/components/HomeHeader";
import { ServiceCard } from "@/components/ServiceCard";
import { InvestmentCard } from "@/components/InvestmentCard";
import { DataLoading } from "@/components/DataLoading";
import { Text } from "@/components/ui/text";
import { Wallet } from "lucide-react-native";
import { useInvestments } from "@/context/investments.context";
import {
  getInvestmentWithdrawal,
  investmentToCardItem,
} from "@/shared/utils/calculateInvestmentIncome";
import { isInvestmentWithdrawn } from "@/shared/constants/investmentStatus";

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

function EmptyInvestments() {
  return (
    <View className="mt-10 items-center px-6">
      <Wallet size={32} color="#71717a" />
      <Text className="mt-3 text-center font-sans-semibold text-lg text-white">
        Nenhum investimento ainda
      </Text>
      <Text className="mt-1 text-center font-sans-medium text-sm text-zinc-500">
        Seus investimentos aparecerão aqui.
      </Text>
    </View>
  );
}

function InvestmentRowSeparator() {
  return <View className="h-3" />;
}

export default function Home() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { investments, selectedInvestment, selectInvestment, loading } =
    useInvestments();

  useEffect(() => {
    if (isAdminEmail(user?.email)) {
      router.replace("/admin" as Href);
    }
  }, [user?.email]);

  if (loading) {
    return <DataLoading />;
  }

  return (
    <View className="flex-1 bg-background">
      
      <FlatList
        className="flex-1"
        data={investments}
        extraData={selectedInvestment?.id}
        keyExtractor={(item) => item.id ?? ""}
        ListHeaderComponent={<HomeListHeader />}
        ListEmptyComponent={EmptyInvestments}
        renderItem={({ item }) => {
          const card = investmentToCardItem(item);
          const investmentId = item.id ?? "";
          return (
            <InvestmentCard
              investmentId={investmentId}
              selected={selectedInvestment?.id === item.id}
              onPress={() => {
                if (investmentId) selectInvestment(investmentId);
              }}
              name={card.name ?? "Investimento"}
              amount={card.amount}
              status={item.status}
              startDate={item.startDate}
              endDate={item.endDate}
              duration={item.duration}
              withdrawal={
                isInvestmentWithdrawn(item.status)
                  ? getInvestmentWithdrawal(item)
                  : null
              }
            />
          );
        }}
        ItemSeparatorComponent={InvestmentRowSeparator}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 16) + 24,
        }}
        nestedScrollEnabled
        removeClippedSubviews={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

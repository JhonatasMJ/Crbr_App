import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Header } from "@/components/Header";
import { ManageInvestmentContent } from "@/components/ManageInvestment";
import { DataLoading } from "@/components/DataLoading";
import { useInvestments } from "@/context/investments.context";

export default function ManageInvestmentScreen() {
  const router = useRouter();
  const { investmentId } = useLocalSearchParams<{ investmentId?: string }>();
  const { investments, loading, selectInvestment } = useInvestments();

  const investment = useMemo(
    () => investments.find((item) => item.id === investmentId),
    [investments, investmentId],
  );

  useEffect(() => {
    if (!loading && investmentId && !investment) {
      router.replace("/(drawer)");
    }
  }, [loading, investment, investmentId, router]);

  useEffect(() => {
    if (investmentId) {
      selectInvestment(investmentId);
    }
  }, [investmentId, selectInvestment]);

  if (loading) {
    return <DataLoading />;
  }

  if (!investment) {
    return <View className="flex-1 bg-background" />;
  }

  return (
    <View className="flex-1 bg-background">
      <Header
        logo={false}
        span="Gerencie sua cota selecionada"
        title="Investimento"
        backHref="/(drawer)"
      />
      <ManageInvestmentContent investment={investment} />
    </View>
  );
}

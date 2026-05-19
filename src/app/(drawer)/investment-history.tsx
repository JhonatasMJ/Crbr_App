import { DataLoading } from "@/components/DataLoading";
import { Header } from "@/components/Header";
import { InvestmentHistoryTimeline } from "@/components/InvestmentHistory/InvestmentHistoryTimeline";
import { InvestmentQuotaPicker } from "@/components/InvestmentHistory/InvestmentQuotaPicker";
import { Text } from "@/components/ui/text";
import { useInvestments } from "@/context/investments.context";
import { buildInvestmentTimeline } from "@/shared/utils/investment-history/buildTimeline";
import { buildQuotaOptions } from "@/shared/utils/investment-history/quotaOptions";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

export default function InvestmentHistory() {
  const { investmentId: paramId } = useLocalSearchParams<{
    investmentId?: string;
  }>();
  const {
    investments,
    deletedInvestments,
    loading,
    selectedInvestment,
    selectInvestment,
  } = useInvestments();

  const quotaOptions = useMemo(
    () => buildQuotaOptions(investments, deletedInvestments),
    [investments, deletedInvestments],
  );

  const [selectedQuotaId, setSelectedQuotaId] = useState<string | undefined>();

  useEffect(() => {
    if (loading || quotaOptions.length === 0) return;

    const preferred =
      (typeof paramId === "string" && paramId) ||
      selectedInvestment?.id ||
      quotaOptions[0]?.id;

    if (preferred && quotaOptions.some((o) => o.id === preferred)) {
      setSelectedQuotaId(preferred);
    } else {
      setSelectedQuotaId(quotaOptions[0]?.id);
    }
  }, [loading, paramId, quotaOptions, selectedInvestment?.id]);

  const events = useMemo(() => {
    if (!selectedQuotaId) return [];
    return buildInvestmentTimeline(
      selectedQuotaId,
      investments,
      deletedInvestments,
    );
  }, [selectedQuotaId, investments, deletedInvestments]);

  function handleQuotaChange(id: string) {
    setSelectedQuotaId(id);
    selectInvestment(id);
  }

  if (loading) {
    return <DataLoading />;
  }

  return (
    <View className="flex-1 bg-background">
      <Header
        logo={false}
        span="Movimentações da cota"
        title="Histórico"
        backHref="/(drawer)"
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {quotaOptions.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-center font-sans text-zinc-400">
              Você ainda não possui cotas para consultar.
            </Text>
          </View>
        ) : (
          <>
            <InvestmentQuotaPicker
              options={quotaOptions}
              value={selectedQuotaId}
              onChange={handleQuotaChange}
            />

            <View className="mt-6">
              <InvestmentHistoryTimeline events={events} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

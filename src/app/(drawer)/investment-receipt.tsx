import { useEffect } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { InvestmentReceiptContent } from "@/components/InvestmentReceiptContent";
import { parseInvestmentReceiptParam } from "@/shared/utils/parseInvestmentReceiptParams";

export default function InvestmentReceiptScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams<{ data?: string }>();
  const receipt = parseInvestmentReceiptParam(data);

  useEffect(() => {
    if (!receipt) {
      router.replace("/(drawer)");
    }
  }, [receipt, router]);

  if (!receipt) {
    return <View className="flex-1 bg-background" />;
  }

  function handleDone() {
    router.replace("/(drawer)");
  }

  return (
    <View className="flex-1 bg-background">
      <InvestmentReceiptContent receipt={receipt} onDone={handleDone} />
    </View>
  );
}

import { InvestmentsForm } from "@/components/Forms/InvestmentsForm";
import { Header } from "@/components/Header";
import { View } from "react-native";

export default function Investments() {
  return (
    <View className="flex-1 bg-background">
      <Header
        logo={false}
        span="Crie seu investimento"
        title="Investir"
        backHref="/(drawer)"
      />
      <View className="flex-1 px-6 pt-4">
        <InvestmentsForm />
      </View>
    </View>
  );
}

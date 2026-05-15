import { InvestmentsForm } from "@/components/Forms/InvestmentsForm";
import { Header } from "@/components/Header";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

export default function Investments() {
  return (
    <View className="flex-1 bg-background">
      <Header logo={false} span="Crie seu investimento" title="Investir" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pt-4 pb-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <InvestmentsForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

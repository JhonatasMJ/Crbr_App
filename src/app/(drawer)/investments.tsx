import { UpdateUserForm } from "@/components/Forms/UpdateUserForm";
import { Header } from "@/components/Header";
import { View } from "react-native";

export default function Investments() {
  return (
    <View className="flex-1 bg-background">
      <Header
        logo={false}
        span="Crie seu investimento"
        title="Investir"
      />
      <View className="gap-12 px-6 pt-4 mt-4">
        <UpdateUserForm />
      </View>
    </View>
  );
}

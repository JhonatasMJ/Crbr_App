import {LoginForm} from "@/components/Forms/LoginForm";
import { Header } from "@/components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";

export default function Login() {
  return (
    <SafeAreaView className="flex-1 bg-background ">
      <Header span="Bem Vindo(a)" title="Entre em sua conta" />
      <View className="flex-1">
        <LoginForm />
      </View>
    </SafeAreaView>
  );
}

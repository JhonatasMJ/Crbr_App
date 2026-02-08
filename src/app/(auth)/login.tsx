import { Header } from "@/components/Header";
import { InputLabel } from "@/components/InputLabel";
import { InputPassword } from "@/components/InputPassword";
import { Button } from "@/components/ui/button";
import { Link } from "expo-router";
import * as Haptics from "expo-haptics";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export default function Login() {
  const [remember, setRemember] = useState(false);

  function toggleRemember() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setRemember((prev) => !prev);
  }

  return (
    <SafeAreaView className="flex-1 bg-background ">
      <Header span="Bem Vindo(a)" title="Entre em sua conta" />
      <View className="px-6 py-12 gap-12">
        <InputLabel label="Email" placeholder="Digite seu email" />
        <InputPassword label="Senha" placeholder="Digite sua senha" />
        <View className="flex-row justify-between">
          <View className="flex-row items-center gap-3">
            <Checkbox
              checked={remember}
              onCheckedChange={toggleRemember}
              checkedClassName="bg-primary"
              iconClassName="text-secondary"
            />
            <Text className="text-sm font-sans-semibold text-white">
              Lembrar Conta
            </Text>
          </View>
           <Link
            href="/(auth)/register"
            className="text-primary font-sans-semibold underline ml-2"
          >
            Esqueci a senha
          </Link>
        </View>
        <Button className="bg-primary" size="xl">
          <Text className="font-sans-bold text-lg">Entrar</Text>
        </Button>
        <View className="flex-row justify-center">
          <Text className="text-white font-sans">Não tem uma conta?</Text>
          <Link
            href="/(auth)/register"
            className="text-primary font-sans-semibold underline ml-2"
          >
            Cadastre-se
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

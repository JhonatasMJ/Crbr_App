import { InputLabel } from "@/components/InputLabel";
import { Button } from "@/components/ui/button";
import { maskCPF } from "@/utils/cpfMask";
import { Link } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
export function RegisterForm() {
const [cpf, setCpf] = useState("");

  return (
    <View className="px-6 py-12 gap-12">
      <InputLabel label="Nome Completo" placeholder="Digite seu nome completo" />
      <InputLabel label="Email" placeholder="Digite seu email" />
      <InputLabel label="CPF" placeholder="Digite seu CPF"   onChangeRawText={(raw) => setCpf(raw)}   maskFunction={maskCPF} />
      <Button className="bg-primary" size="xl">
        <Text className="font-sans-bold text-lg">Entrar</Text>
      </Button>
      <View className="flex-row justify-center">
        <Text className="text-white font-sans">Já tem uma conta?</Text>
        <Link
          href="/(auth)/login"
          className="text-primary font-sans-semibold underline ml-2"
        >
          Entrar
        </Link>
      </View>
    </View>
  );
}

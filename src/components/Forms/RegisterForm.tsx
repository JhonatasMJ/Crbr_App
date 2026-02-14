import { InputLabel } from "@/components/InputLabel";
import { Button } from "@/components/ui/button";
import { maskCPF } from "@/utils/cpfMask";
import { Link } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Text } from "../ui/text";
export function RegisterForm() {
const [cpf, setCpf] = useState("");

  return (
    <View className=" gap-12">
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

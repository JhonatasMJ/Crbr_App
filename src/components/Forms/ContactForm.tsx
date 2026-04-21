import { InputLabel } from "@/components/InputLabel";
import { Button } from "@/components/ui/button";
import { Link } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";
import { Text } from "../ui/text";




export function ContactForm({ onNext }: { onNext: () => void }) {
  const [cpf, setCpf] = useState("");

  
  function handleNext() {
    if (!cpf) {
      Alert.alert("CPF é obrigatório");
      return;
    }
    onNext();
  }

  return (
    <View className="gap-12">
      <InputLabel
        label="Telefone"
        placeholder="Digite seu telefone"
      />
      <InputLabel label="Data de nascimento" placeholder="DD/MM/AAAA" />

      <InputLabel
        label="Email"
        placeholder="Digite seu email"
      />
      <Button className="bg-primary" size="xl" onPress={handleNext}>
        <Text className="font-sans-bold text-lg">Próximo</Text>
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

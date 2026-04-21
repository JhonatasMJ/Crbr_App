import { InputLabel } from "@/components/InputLabel";
import { Button } from "@/components/ui/button";
import { Link } from "expo-router";
import { View } from "react-native";
import { Text } from "../ui/text";
import { Resolver, useForm } from "react-hook-form";
import { registerContactSchema } from "@/shared/schemas/registerContactSchema";
import { yupResolver } from "@hookform/resolvers/yup";

type ContactFields = {
  phone: string;
  birthDate: string;
  city: string;
};

export function ContactForm({ onNext }: { onNext: () => void }) {
  const { control } = useForm<ContactFields>({
    defaultValues: {
      phone: "",
      birthDate: "",
      city: "",
    },
    resolver: yupResolver(registerContactSchema) as Resolver<ContactFields>,
  });

  function handleNext() {
    onNext();
  }

  return (
    <View className="gap-12">
      <InputLabel
        control={control}
        name="phone"
        label="Telefone"
        placeholder="Digite seu telefone"
      />
      <InputLabel
        control={control}
        name="birthDate"
        label="Data de nascimento"
        placeholder="DD/MM/AAAA"
      />
      <InputLabel
        control={control}
        name="city"
        label="Cidade"
        placeholder="Digite sua cidade"
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

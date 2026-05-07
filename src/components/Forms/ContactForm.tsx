import type { Control } from "react-hook-form";
import type { RegisterParams } from "@/types/registerParams";
import { PhoneInputLabel } from "@/components/PhoneInputLabel";
import { InputLabel } from "@/components/InputLabel";
import { Button } from "@/components/ui/button";
import { Link } from "expo-router";
import { View } from "react-native";
import { Text } from "../ui/text";
import { maskDate } from "@/shared/utils/masks/dateMask";

export function ContactForm({
  control,
  onNext,
}: {
  control: Control<RegisterParams>;
  onNext: () => void | Promise<void>;
}) {
  return (
    <View className="gap-12">
      <PhoneInputLabel control={control} name="phone" label="Telefone" />
      <InputLabel
        control={control}
        name="birthDate"
        label="Data de nascimento"
        placeholder="DD/MM/AAAA"
        maskFunction={maskDate}
      />
      <InputLabel
        control={control}
        name="city"
        label="Cidade"
        placeholder="Digite sua cidade"
      />
      <Button className="bg-primary" size="xl" onPress={() => void onNext()}>
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

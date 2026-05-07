import type { Control } from "react-hook-form";
import type { RegisterParams } from "@/types/registerParams";
import { Button } from "../ui/button";
import { Text, View } from "react-native";
import { InputLabel } from "../InputLabel";
import { maskCPF } from "@/shared/utils/masks/cpfMask";

export function RegisterForm({
  control,
  onNext,
}: {
  control: Control<RegisterParams>;
  onNext: () => void | Promise<void>;
}) {
  return (
    <View className="gap-10">
      <InputLabel
        control={control}
        name="name"
        label="Nome Completo"
        placeholder="Digite seu nome completo"
      />

      <InputLabel
        control={control}
        name="email"
        label="Email"
        placeholder="Digite seu email"
      />

      <InputLabel 
      control={control} 
      name="cpf" 
      label="CPF" 
      maskFunction={maskCPF} 
      placeholder="Digite seu CPF" />

      <Button className="bg-primary" size="xl" onPress={() => void onNext()}>
        <Text className="font-sans-bold text-lg">Próximo</Text>
      </Button>
    </View>
  );
}

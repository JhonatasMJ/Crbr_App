import type { Control } from "react-hook-form";
import type { RegisterParams } from "@/types/registerParams";
import { Button } from "@/components/ui/button";
import { InputPassword } from "@/components/InputPassword";
import { ActivityIndicator, Text, View } from "react-native";

export function RegisterPasswordForm({
  control,
  onSubmit,
  isSubmitting,
}: {
  control: Control<RegisterParams>;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  return (
    <View className="gap-10">
      <InputPassword 
      control={control} 
      name="password" 
      label="Senha" 
      placeholder="Digite sua senha" 
      secureTextEntry={true}
      />
      <InputPassword
        control={control}
        name="confirmPassword"
        label="Confirmar senha"
        placeholder="Digite sua senha novamente"
        secureTextEntry={true}
      />
      <Button
        className="bg-primary"
        size="xl"
        onPress={onSubmit}
        disabled={isSubmitting}
      >
        <Text className="font-sans-bold text-lg">
          {isSubmitting ? <ActivityIndicator size="small" color="#111" /> : "Cadastrar"}
        </Text>
      </Button>
    </View>
  );
}

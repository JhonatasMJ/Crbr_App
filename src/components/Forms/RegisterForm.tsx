import { InputLabel } from "@/components/InputLabel";
import { Button } from "@/components/ui/button";
import { maskCPF } from "@/shared/utils/cpfMask";
import { Link } from "expo-router";
import { View } from "react-native";
import { Text } from "../ui/text";
import { useForm } from "react-hook-form";
import { RegisterPersonalStep } from "@/types/registerParams";
import { registerSchema } from "@/shared/schemas/registerSchema";
import { yupResolver } from "@hookform/resolvers/yup";

export function RegisterForm({ onNext }: { onNext: () => void }) {
  function handleNext() {
    onNext();
  }

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterPersonalStep>({
    defaultValues: {
      name: "",
      email: "",
      cpf: "",
    },
    resolver: yupResolver(registerSchema),
  });

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
        placeholder="Digite seu CPF"
        maskFunction={maskCPF}
      />
      <Button
        className="bg-primary"
        size="xl"
        onPress={handleSubmit(handleNext)}
        disabled={isSubmitting}
      >
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

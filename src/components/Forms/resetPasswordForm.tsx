import { useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Text, View } from "react-native";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link } from "expo-router";

import { InputLabel } from "../InputLabel";
import { Button } from "../ui/button";
import { useAuth } from "@/context/auth.context";
import { resetPasswordSchema } from "@/shared/schemas/resetPasswordSchema";

type ResetPasswordParams = {
  email: string;
};

export function ResetPasswordForm() {
  const { resetPassword, loading } = useAuth();
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);
  const { control, handleSubmit } = useForm<ResetPasswordParams>({
    defaultValues: {
      email: "",
    },
    resolver: yupResolver(resetPasswordSchema),
  });

  async function handleResetPassword(data: ResetPasswordParams) {
    try {
      const email = await resetPassword(data.email);
      setSentToEmail(email);
    } catch {
      /* erros exibidos no auth.context */
    }
  }

  if (sentToEmail) {
    return (
      <View className="flex-1 gap-8 px-6 py-12">
        <Text className="font-sans text-base leading-7 text-zinc-300">
          Foi enviado um e-mail para{" "}
          <Text className="font-sans-semibold text-primary">{sentToEmail}</Text>
          . Verifique sua caixa de entrada e o spam e siga o link para redefinir
          sua senha.
        </Text>

        <Link href="/(auth)/login" asChild>
          <Button className="bg-primary" size="xl">
            <Text className="font-sans-bold text-lg text-black">
              Voltar ao login
            </Text>
          </Button>
        </Link>
      </View>
    );
  }

  return (
    <View className="gap-10 px-6 py-12">
      <InputLabel
        control={control}
        name="email"
        label="Email"
        placeholder="Digite seu email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      <Button
        className="bg-primary"
        size="xl"
        disabled={loading}
        onPress={handleSubmit(handleResetPassword)}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#111" />
        ) : (
          <Text className="font-sans-bold text-lg text-black">
            Enviar link de redefinição
          </Text>
        )}
      </Button>

      <View className="flex-row justify-center">
        <Text className="font-sans text-white">Lembrou a senha?</Text>
        <Link
          href="/(auth)/login"
          className="ml-2 font-sans-semibold text-primary underline"
        >
          Entrar
        </Link>
      </View>
    </View>
  );
}

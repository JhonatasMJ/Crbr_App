import { useForm } from "react-hook-form";
import { ActivityIndicator, Text, View } from "react-native";
import { InputLabel } from "../InputLabel";
import { Button } from "../ui/button";
import { useAuth } from "@/context/auth.context";
import { Link } from "expo-router";
import { resetPasswordSchema } from "@/shared/schemas/resetPasswordSchema";
import { yupResolver } from "@hookform/resolvers/yup";

type ResetPasswordParams = {
  email: string;
};

export function ResetPasswordForm() {
  const { resetPassword, loading } = useAuth();
  const { control, handleSubmit } = useForm<ResetPasswordParams>({
    defaultValues: {
      email: "",
    },
    resolver: yupResolver(resetPasswordSchema),
  });
  
  async function handleResetPassword(data: ResetPasswordParams) {
    try {
      await resetPassword(data.email);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  return (
    <View className="px-6 py-12 gap-10">
      
      <InputLabel
        control={control}
        name="email"
        label="Email"
        placeholder="Digite seu email"
      />
      <Button className="bg-primary" size="xl" onPress={handleSubmit(handleResetPassword)}>
        {loading ? <ActivityIndicator size="small" color="#111" /> : (
          <Text className="font-sans-bold text-lg">
            Enviar link de redefinição
          </Text>
        )}
      </Button>
      <View className="flex-row justify-center">
        <Text className="text-white font-sans">Lembrou a senha?</Text>
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

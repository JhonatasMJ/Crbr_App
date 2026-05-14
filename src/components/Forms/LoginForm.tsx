import { InputLabel } from "@/components/InputLabel";
import { InputPassword } from "@/components/InputPassword";
import { Button } from "@/components/ui/button";
import { Link, router, type Href } from "expo-router";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ActivityIndicator, Text, View } from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoginParams } from "@/types/loginParams";
import { loginSchema } from "@/shared/schemas/loginSchema";
import { useAuth } from "@/context/auth.context";

export function LoginForm() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<LoginParams>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: yupResolver(loginSchema),
  });
  const [remember, setRemember] = useState(false);
  const {
    loginWithRemember,
    getRememberedLogin,
    clearRememberedLogin,
    loading,
    user,
  } = useAuth();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await getRememberedLogin();
        if (cancelled || !saved) return;
        reset({ email: saved.email, password: saved.password });
        setRemember(true);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reset, getRememberedLogin]);

  useEffect(() => {
    if (user) {
      router.replace("/(drawer)" as Href);
    }
  }, [user]);

  async function handleLogin(data: LoginParams) {
    try {
      await loginWithRemember(data, remember);
      router.replace("/(drawer)" as Href);
    } catch {}
  }

  function handleRememberChange(next: boolean) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setRemember(next);
    if (!next) {
      void clearRememberedLogin();
    }
  }

  return (
    <View className="px-6 py-12 gap-12">
      <InputLabel
        control={control}
        name="email"
        label="Email"
        placeholder="Digite seu email"
      />
      <InputPassword
        control={control}
        name="password"
        label="Senha"
        placeholder="Digite sua senha"
      />
      <View className="flex-row justify-between">
        <View className="flex-row items-center gap-3">
          <Checkbox
            checked={remember}
            onCheckedChange={(v) => handleRememberChange(!!v)}
            checkedClassName="bg-primary"
            iconClassName="text-secondary"
          />
          <Text className="text-sm font-sans-semibold text-white">
            Lembrar Conta
          </Text>
        </View>
        <Link
          href="/(auth)/resetPassword"
          className="text-primary font-sans-semibold underline ml-2"
        >
          Esqueci a senha
        </Link>
      </View>
      <Button
        className="bg-primary"
        size="xl"
        onPress={handleSubmit(handleLogin)}
        disabled={isSubmitting}
      >
        {loading ? (
          <ActivityIndicator size="small" className="text-black" />
        ) : (
          <Text className="font-sans-bold text-lg">Entrar</Text>
        )}
      </Button>
      <View className="flex-row justify-center">
        <Text className="text-white font-sans">Não tem uma conta?</Text>
        <Link
          href="/(auth)/register"
          className="text-primary font-sans-semibold underline ml-2"
        >
          Cadastre-se
        </Link>
      </View>
    </View>
  );
}

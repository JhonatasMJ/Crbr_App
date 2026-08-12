import { InputLabel } from "@/components/InputLabel";
import { InputPassword } from "@/components/InputPassword";
import { KeyboardView } from "@/components/KeyboardView";
import { Button } from "@/components/ui/button";
import { Link, router, useLocalSearchParams } from "expo-router";
import { getPostAuthHref } from "@/shared/utils/authRouting";
import { isBiometricLoginAvailable } from "@/shared/utils/biometricAuth";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoginParams } from "@/types/loginParams";
import { loginSchema } from "@/shared/schemas/loginSchema";
import { useAuth } from "@/context/auth.context";
import { Fingerprint } from "lucide-react-native";
import { colors } from "@/themes/colors";

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
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const hasRememberedCredentials = useRef(false);
  const biometricAutoPrompted = useRef(false);
  const { skipBiometric } = useLocalSearchParams<{ skipBiometric?: string }>();
  const {
    loginWithRemember,
    tryBiometricRememberedLogin,
    getRememberedLogin,
    clearRememberedLogin,
    loading,
    user,
    userProfile,
  } = useAuth();

  const attemptBiometricLogin = useCallback(async () => {
    if (!hasRememberedCredentials.current || biometricLoading) return false;

    setBiometricLoading(true);
    try {
      /* sucesso dispara onAuthStateChanged; o effect de user redireciona */
      return await tryBiometricRememberedLogin();
    } finally {
      setBiometricLoading(false);
    }
  }, [biometricLoading, tryBiometricRememberedLogin]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await getRememberedLogin();
        if (cancelled || !saved) return;
        reset({ email: saved.email, password: saved.password });
        setRemember(true);
        hasRememberedCredentials.current = true;

        const bioAvailable = await isBiometricLoginAvailable();
        if (cancelled) return;
        setBiometricAvailable(bioAvailable);

        if (
          bioAvailable &&
          skipBiometric !== "1" &&
          !biometricAutoPrompted.current
        ) {
          biometricAutoPrompted.current = true;
          setBiometricLoading(true);
          try {
            const success = await tryBiometricRememberedLogin();
            if (cancelled || !success) return;
            /* user atualiza via onAuthStateChanged; o effect abaixo redireciona */
          } finally {
            if (!cancelled) setBiometricLoading(false);
          }
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    reset,
    getRememberedLogin,
    skipBiometric,
    tryBiometricRememberedLogin,
  ]);

  useEffect(() => {
    if (user && user.emailVerified && userProfile) {
      router.replace(getPostAuthHref(user, userProfile?.email, true));
    }
  }, [user, userProfile]);

  async function handleLogin(data: LoginParams) {
    try {
      await loginWithRemember(data, remember);
      /* redirecionamento pelo effect quando user atualizar */
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message === "EMAIL_NOT_VERIFIED"
      ) {
        router.replace("/(auth)/verifyEmail");
      }
    }
  }

  function handleRememberChange(next: boolean) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setRemember(next);
    if (!next) {
      void clearRememberedLogin();
    }
  }

  return (
    <KeyboardView className="flex-1" contentContainerClassName="px-6 py-12 gap-12">
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
        disabled={isSubmitting || biometricLoading}
      >
        {loading || biometricLoading ? (
          <ActivityIndicator size="small" className="text-black" />
        ) : (
          <Text className="font-sans-bold text-lg">Entrar</Text>
        )}
      </Button>
      {remember && biometricAvailable ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Entrar com biometria"
          onPress={() => void attemptBiometricLogin()}
          disabled={biometricLoading || loading}
          className="flex-row items-center justify-center gap-2 py-2"
        >
          <Fingerprint size={22} color={colors.primary} />
          <Text className="font-sans-semibold text-primary">
            Entrar com biometria
          </Text>
        </Pressable>
      ) : null}
      <View className="flex-row justify-center">
        <Text className="text-white font-sans">Não tem uma conta?</Text>
        <Link
          href="/(auth)/register"
          className="text-primary font-sans-semibold underline ml-2"
        >
          Cadastre-se
        </Link>
      </View>
    </KeyboardView>
  );
}

import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth.context";
import { getPostLoginHref } from "@/shared/utils/authRouting";

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmail() {
  const {
    loading,
    resendEmailVerification,
    completeRegistrationAfterEmailVerification,
    getPendingRegistrationEmail,
  } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pendingEmail = await getPendingRegistrationEmail();
      if (cancelled) return;
      if (!pendingEmail) {
        router.replace("/(auth)/login");
        return;
      }
      setEmail(pendingEmail);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [getPendingRegistrationEmail]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || loading) return;
    try {
      await resendEmailVerification();
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      /* notificado no context */
    }
  }, [cooldown, loading, resendEmailVerification]);

  const handleConfirm = useCallback(async () => {
    if (checking || loading || !email) return;
    setChecking(true);
    try {
      const created = await completeRegistrationAfterEmailVerification();
      if (created) {
        router.replace(getPostLoginHref(email));
      }
    } catch {
      /* notificado no context */
    } finally {
      setChecking(false);
    }
  }, [checking, loading, email, completeRegistrationAfterEmailVerification]);

  if (!ready || !email) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header
        span="Quase lá"
        title="Confirme seu e-mail"
        backHref="/(auth)/login"
      />
      <View className="flex-1 gap-8 px-6 py-12">
        <Text className="font-sans text-base leading-7 text-zinc-300">
          Foi enviado um e-mail para{" "}
          <Text className="font-sans-semibold text-primary">{email}</Text>.
          Verifique sua caixa de entrada e o spam, confirme o endereço e toque
          no botão abaixo para criar sua conta.
        </Text>

        <Button
          className="bg-primary"
          size="xl"
          disabled={checking || loading}
          onPress={() => void handleConfirm()}
        >
          {checking || loading ? (
            <ActivityIndicator size="small" color="#111" />
          ) : (
            <Text className="font-sans-bold text-lg text-black">
              Já confirmei o e-mail
            </Text>
          )}
        </Button>

        <Button
          variant="outline"
          size="xl"
          disabled={cooldown > 0 || loading || checking}
          onPress={() => void handleResend()}
        >
          <Text className="font-sans-semibold text-base text-foreground">
            {cooldown > 0
              ? `Reenviar em ${cooldown}s`
              : "Reenviar e-mail de confirmação"}
          </Text>
        </Button>

        <View className="flex-row justify-center">
          <Text className="font-sans text-white">Já tem conta?</Text>
          <Link
            href="/(auth)/login"
            className="ml-2 font-sans-semibold text-primary underline"
          >
            Entrar
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

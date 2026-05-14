import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { RegisterForm } from "@/components/Forms/RegisterForm";
import { ContactForm } from "@/components/Forms/ContactForm";
import { RegisterPasswordForm } from "@/components/Forms/RegisterPasswordForm";
import { useForm } from "react-hook-form";
import type { RegisterParams } from "@/types/registerParams";
import { registerFullSchema } from "@/shared/schemas/registerFullSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "@/context/auth.context";
import { ActivityIndicator } from "react-native";
import { router, type Href } from "expo-router";
const steps = ["account", "contact", "password"] as const;

const STEP_ORDER: Record<(typeof steps)[number], number> = {
  account: 0,
  contact: 1,
  password: 2,
};

export default function Register() {
  const { register, loading, user } = useAuth();
  const [activeTab, setActiveTab] = useState<(typeof steps)[number]>("account");

  const {
    control,
    handleSubmit,
    trigger,
    formState: { isSubmitting },
  } = useForm<RegisterParams>({
    defaultValues: {
      name: "",
      email: "",
      cpf: "",
      phoneNumber: "",
      birthDate: "",
      city: "",
      password: "",
      confirmPassword: "",
    },
    resolver: yupResolver(registerFullSchema),
    mode: "onChange",
  });

  async function handleTabChange(next: (typeof steps)[number]) {
    if (next === activeTab) return;

    if (STEP_ORDER[next] < STEP_ORDER[activeTab]) {
      setActiveTab(next);
      return;
    }

    if (activeTab === "account" && next === "contact") {
      const ok = await trigger(["name", "email", "cpf"], { shouldFocus: true });
      if (ok) setActiveTab("contact");
      return;
    }

    if (activeTab === "account" && next === "password") {
      const accountOk = await trigger(["name", "email", "cpf"], {
        shouldFocus: true,
      });
      if (!accountOk) return;
      const contactOk = await trigger(["phoneNumber", "birthDate", "city"], {
        shouldFocus: true,
      });
      if (contactOk) setActiveTab("password");
      return;
    }

    if (activeTab === "contact" && next === "password") {
      const ok = await trigger(["phoneNumber", "birthDate", "city"], {
        shouldFocus: true,
      });
      if (ok) setActiveTab("password");
    }
  }

  async function goNextFromAccount() {
    await handleTabChange("contact");
  }

  async function goNextFromContact() {
    await handleTabChange("password");
  }

  /* Redireciona para a tela de login se o usuário estiver logado */
  useEffect(() => {
    if (user) {
      router.replace("/(drawer)" as Href);
    }
  }, [user]);

  /* Função para enviar o cadastro completo */
  async function submitAll(payload: RegisterParams) {
    await register(payload);
  }
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Header span="Bem Vindo(a)" title="Crie sua conta" />

          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              if (v === "account" || v === "contact" || v === "password") {
                void handleTabChange(v);
              }
            }}
            className="mt-6"
          >
            <TabsList className="bg-secondary ">
              <TabsTrigger  value="account">Pessoais</TabsTrigger>
              <TabsTrigger value="contact">Contato</TabsTrigger>
              <TabsTrigger value="password">Senha</TabsTrigger>
            </TabsList>

            <TabsContent value="account">
              <RegisterForm control={control} onNext={goNextFromAccount} />
            </TabsContent>

            <TabsContent value="contact">
              <ContactForm control={control} onNext={goNextFromContact} />
            </TabsContent>

            <TabsContent value="password">
              <RegisterPasswordForm
                control={control}
                onSubmit={handleSubmit(submitAll)}
                isSubmitting={isSubmitting}
              />
            </TabsContent>
          </Tabs>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

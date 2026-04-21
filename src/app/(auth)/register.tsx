import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { RegisterForm } from "@/components/Forms/RegisterForm";
import { ContactForm } from "@/components/Forms/ContactForm";
import { RegisterPasswordForm } from "@/components/Forms/RegisterPasswordForm";
import { useForm } from "react-hook-form";
import type { RegisterParams } from "@/types/registerParams";
import { registerFullSchema } from "@/shared/schemas/registerFullSchema";
import { yupResolver } from "@hookform/resolvers/yup";

const steps = ["account", "contact", "password"] as const;

export default function Register() {
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
      phone: "",
      birthDate: "",
      city: "",
      password: "",
      confirmPassword: "",
    },
    resolver: yupResolver(registerFullSchema),
    mode: "onChange",
  });

  /* Função para ir para a próxima aba */
  function goToTab(next: (typeof steps)[number]) {
    setActiveTab(next);
  }

  /* Função para ir para a próxima aba a partir da aba de conta */
  async function goNextFromAccount() {
    const valid = await trigger(["name", "email", "cpf"], { shouldFocus: true });
    if (valid) goToTab("contact");
  }

  /* Função para ir para a próxima aba a partir da aba de contato */
  async function goNextFromContact() {
    const valid = await trigger(["phone", "birthDate", "city"], {
      shouldFocus: true,
    });
    if (valid) goToTab("password");
  }

  /* Função para enviar o cadastro completo */
  async function submitAll(payload: RegisterParams) {
    console.log("Cadastro completo:", payload);
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
                setActiveTab(v);
              }
            }}
            className="mt-6"
          >
            <TabsList className="bg-secondary ">
              <TabsTrigger value="account">Pessoais</TabsTrigger>
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

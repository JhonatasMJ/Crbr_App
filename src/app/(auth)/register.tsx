import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from "react-native";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { RegisterForm } from "@/components/Forms/RegisterForm";
import { ContactForm } from "@/components/Forms/ContactForm";

export default function Register() {
  const [value, setValue] = useState("account");
  const steps = ["account", "contact", "password"];

  function handleNextTab() {
     const currentIndex = steps.indexOf(value);
     if (currentIndex < steps.length - 1) {
      setValue(steps[currentIndex + 1]);
     }
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

          <Tabs value={value} onValueChange={setValue} className="mt-6">
            <TabsList className="bg-secondary ">
              <TabsTrigger value="account">Pessoais</TabsTrigger>
              <TabsTrigger value="contact">Contato</TabsTrigger>
              <TabsTrigger value="password">Senha</TabsTrigger>
            </TabsList>

            <TabsContent value="account">
              <RegisterForm onNext={handleNextTab} />
            </TabsContent>

            <TabsContent value="contact">
              <ContactForm onNext={handleNextTab} />
            </TabsContent>

            <TabsContent value="password">
              <Text className="text-white">Conteúdo de senha</Text>
            </TabsContent>
          </Tabs>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

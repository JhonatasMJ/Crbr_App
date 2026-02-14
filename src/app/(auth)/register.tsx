import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Text } from "react-native";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { RegisterForm } from "@/components/Forms/RegisterForm";

export default function Register() {
  const [value, setValue] = useState("account");

  return (
    <SafeAreaView className="flex-1 bg-background ">
      <Header span="Bem Vindo(a)" title="Crie sua conta" />

      <Tabs value={value} onValueChange={setValue} className="mt-6">
        <TabsList className="bg-secondary ">
          <TabsTrigger value="account">Pessoais</TabsTrigger>
          <TabsTrigger value="contact">Contato</TabsTrigger>
          <TabsTrigger value="password">Senha</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <RegisterForm />
        </TabsContent>

        <TabsContent value="contact">
          <Text className="text-white">Conteúdo de contato</Text>
        </TabsContent>

        <TabsContent value="password">
          <Text className="text-white">Conteúdo de senha</Text>
        </TabsContent>
      </Tabs>
    </SafeAreaView>
  );
}

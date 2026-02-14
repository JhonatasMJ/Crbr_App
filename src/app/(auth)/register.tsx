import {RegisterForm} from "@/components/Forms/RegisterForm";
import { Header } from "@/components/Header";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Register() {
  return (
    <SafeAreaView className="flex-1 bg-background ">
      <Header span="Bem Vindo(a)" title="Crie sua conta" />
      <RegisterForm />
    </SafeAreaView>
  );
}

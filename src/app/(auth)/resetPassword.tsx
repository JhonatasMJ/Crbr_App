import {LoginForm} from "@/components/Forms/LoginForm";
import { ResetPasswordForm } from "@/components/Forms/resetPasswordForm";
import { Header } from "@/components/Header";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  return (
    <SafeAreaView className="flex-1 bg-background ">
      <Header span="Esqueceu sua senha?" title="Redefinir senha" />
      <ResetPasswordForm />
    </SafeAreaView>
  );
}

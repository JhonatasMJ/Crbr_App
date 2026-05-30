import { ResetPasswordForm } from "@/components/Forms/resetPasswordForm";
import { Header } from "@/components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";

export default function ResetPassword() {
  return (
    <SafeAreaView className="flex-1 bg-background ">
      <Header span="Esqueceu sua senha?" title="Redefinir senha" />
      <View className="flex-1">
        <ResetPasswordForm />
      </View>
    </SafeAreaView>
  );
}

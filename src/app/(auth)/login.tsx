import { Header } from "@/components/Header";
import { InputLabel } from "@/components/InputLabel";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login () {
  return (
   <SafeAreaView className="flex-1 bg-background ">
          <Header
          span="Bem Vindo(a)"
          title="Entre em sua conta"
          />
          <View className="px-6 py-12 gap-12">
            <InputLabel label="Email" placeholder="Digite seu email"  />
            <InputLabel label="Senha" placeholder="Digite sua senha" secureTextEntry={true} />
          </View>
     </SafeAreaView>
  )
}
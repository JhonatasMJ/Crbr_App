import { Text } from "@/src/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui/button";

export default function LoginScreen () {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Text className="font-sans-bold text-2xl text-white">R$ 5000</Text>
      <Button className="bg-primary">
        <Text className="font-sans-bold">Teste</Text>
      </Button>
    </SafeAreaView>
  )
}
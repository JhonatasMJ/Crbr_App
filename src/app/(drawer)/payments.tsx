import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useSnackBarContext } from "@/context/snackbar.context";
import { colors } from "@/themes/colors";
import * as Clipboard from "expo-clipboard";
import { Copy } from "lucide-react-native";
import { Image } from "react-native";
import { View } from "react-native";
import Pix from "@/assets/pix.svg";

export default function Payments() {
  const pixKey = "5284783400130";
  const randomKey = "00020126360014br.gov.bcb.pix0114528478340001305204000053039865802BR5925CRBR_INVESTIMENTOS_E_CONS6012Pitangueiras610914760-00062290525WITT71328769175088792090263042693";
  const displayedRandomKey =
    randomKey.length > 36 ? `${randomKey.slice(0, 36)}...` : randomKey;
  const { notify } = useSnackBarContext();

  async function handleCopyPixKey() {
    await Clipboard.setStringAsync(pixKey);

    notify({
      message: "Chave Pix copiada",
      messageType: "SUCCESS",
    });
  }

  async function handleCopyRandomPixKey() {
    await Clipboard.setStringAsync(randomKey);

    notify({
      message: "Chave aleatória copiada",
      messageType: "SUCCESS",
    });
  }

  return (
    <View className="flex-1 bg-background">
      <Header
        logo={false}
        span="Chave pix para saque e investimentos"
        title="Pagamentos"
      />
      <View className="gap-12 px-6 pt-4 mt-4">
        <View>
          <Text className="text-primary font-sans-semibold text-xl">
            Chave Pix (Cnpj)
          </Text>
          <Input
            className="text-white"
            value={pixKey}
            editable={false}
            selectTextOnFocus={false}
          />
          <Button
            className="absolute right-0 bottom-4"
            onPress={handleCopyPixKey}
            variant="ghost"
            size="icon"
          >
            <Copy size={20} color={colors.primary} />
          </Button>
        </View>
        <View>
          <Text className="text-primary font-sans-semibold text-xl">
            Chave Aleatória
          </Text> 
          <Input
            className="text-white"
            value={displayedRandomKey}
            editable={false}
            selectTextOnFocus={false}
          />
          <Button
            className="absolute right-0 bottom-4"
            onPress={handleCopyRandomPixKey}
            variant="ghost"
            size="icon"
          >
            <Copy size={20} color={colors.primary} />
          </Button>
        </View>
        <View>
        <Text className="text-primary font-sans-semibold text-xl mb-4">
            QR Code
          </Text> 
          <Pix className="w-full object-cover"  />
        </View>
      </View>
    </View>
  );
}

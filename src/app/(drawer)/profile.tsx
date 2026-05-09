import { UpdateUserForm } from "@/components/Forms/UpdateUserForm";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { colors } from "@/themes/colors";
import { Copy } from "lucide-react-native";
import { View } from "react-native";

export default function Profile() {
  return (
    <View className="flex-1 bg-background">
      <Header
        logo={false}
        span="Visualize e edite seus dados"
        title="Perfil"
      />
      <View className="gap-12 px-6 pt-4 mt-4">
        <UpdateUserForm />
      </View>
    </View>
  );
}

import { useAuth } from "@/context/auth.context";
import { getFirstName } from "@/shared/utils/formatName";
import { Text, View, Pressable } from "react-native";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import Logo from "@/assets/logoSvg.svg";
import Line from "@/assets/line.svg";
import { Menu } from "lucide-react-native";
import { useInvestments } from "@/context/investments.context";

export function HomeHeader() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { investments } = useInvestments();
  function handleOpenDrawer() {
    const parentNavigation = navigation.getParent();

    if (parentNavigation) {
      parentNavigation.dispatch(DrawerActions.openDrawer());
      return;
    }

    navigation.dispatch(DrawerActions.openDrawer());
  }

  return (
    <View className="bg-primary h-56 rounded-b-xl p-6 py-10">
      <View className="flex-row items-center justify-between">
        <Pressable onPress={handleOpenDrawer} className="p-2">
          <Menu size={24} color="#111" />
        </Pressable>
        <View className="flex-row items-center gap-2">
          <View>
            <Text className="font-sans-semibold text- text-right">Olá,</Text>
            <Text className="text-secondary font-sans-bold text-xl">
              {getFirstName(user?.displayName || "")}
            </Text>
          </View>
          <Logo width={30} />
        </View>
      </View>
      <View className="mt-2">
        <Line />
      </View>
      <View className="mt-4">
        <Text className="font-sans-semibold text-xl text-primary-foreground">Seu saldo</Text>
        <Text className="font-sans-bold text-2xl text-primary-foreground">R$ {investments.reduce((acc, investment) => acc + Number(investment.amount), 0).toFixed(2)}</Text>
      </View>
    </View>
  );
}

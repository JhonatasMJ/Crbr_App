import { useAuth } from "@/context/auth.context";
import { getFirstName } from "@/shared/utils/formatName";
import { Text, View, Pressable, FlatList } from "react-native";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import Logo from "@/assets/logoSvg.svg";
import Line from "@/assets/line.svg";
import { Menu } from "lucide-react-native";
import { useInvestments } from "@/context/investments.context";
import { getHeaderStatisticItems } from "@/shared/utils/statisticData";
import { StatisticCard } from "./StatisticCard";

export function HomeHeader() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { investments, balanceFormatted } = useInvestments();
  const firstInvestment = investments[0];

  function handleOpenDrawer() {
    const parentNavigation = navigation.getParent();

    if (parentNavigation) {
      parentNavigation.dispatch(DrawerActions.openDrawer());
      return;
    }

    navigation.dispatch(DrawerActions.openDrawer());
  }

  return (
    <View className="bg-primary  rounded-b-xl p-6 py-10">
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
        <Text className="font-sans-semibold text-xl text-primary-foreground">
          Seu saldo
        </Text>
        <Text className="font-sans-bold text-3xl text-primary-foreground">
          {balanceFormatted}
        </Text>
        <Text className="mt-6 font-sans-bold text-lg text-primary-foreground">
          Estatísticas
        </Text>
        <FlatList
          data={getHeaderStatisticItems(firstInvestment)}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2 max-h-52 flex-grow-0"
          contentContainerClassName="gap-4 pb-1"
          renderItem={({ item }) => (
            <StatisticCard
              title={item.title}
              value={item.value}
              icon={item.icon}
            />
          )}
        />
      </View>
    </View>
  );
}

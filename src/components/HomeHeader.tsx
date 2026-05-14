import { useAuth } from "@/context/auth.context";
import { getFirstName } from "@/shared/utils/formatName";
import { formatInvestmentAmount } from "@/shared/utils/formatInvestmentAmount";
import { Text, View, Pressable, FlatList, TextInput } from "react-native";
import {
  DrawerActions,
  useNavigation,
  type NavigationProp,
  type ParamListBase,
} from "@react-navigation/native";
import Logo from "@/assets/logoSvg.svg";
import Line from "@/assets/line.svg";
import { Eye, EyeOff, Menu } from "lucide-react-native";
import { useInvestments } from "@/context/investments.context";
import { getHeaderStatisticItems } from "@/shared/utils/statisticData";
import { StatisticCard } from "./StatisticCard";
import { Button } from "./ui/button";

export function HomeHeader() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { selectedInvestment, TotalBalance, handleToggleBalance, showData } =
    useInvestments();

  function handleOpenDrawer() {
    let current = navigation as NavigationProp<ParamListBase>;
    for (let i = 0; i < 8 && current; i++) {
      const state = current.getState();
      if (
        state &&
        typeof state === "object" &&
        "type" in state &&
        state.type === "drawer"
      ) {
        current.dispatch(DrawerActions.openDrawer());
        return;
      }
      current = current.getParent() as NavigationProp<ParamListBase>;
    }
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
        <View className="flex-row items-end justify-between">
          <View>
            <Text className="font-sans-semibold text-xl text-primary-foreground">
              Seu saldo
            </Text>
            <TextInput
              editable={false}
              selectTextOnFocus={false}
              secureTextEntry={!showData}
              className="font-sans-bold text-3xl text-primary-foreground p-0 m-0"
              style={{ includeFontPadding: false, textAlignVertical: "center" }}
              value={formatInvestmentAmount(TotalBalance)}
            />
          </View>
          <View>
            <Button
              size="icon"
              className="bg-secondary"
              onPress={handleToggleBalance}
            >
              {showData ? (
                <EyeOff size={16} color="#fff" />
              ) : (
                <Eye size={16} color="#fff" />
              )}
            </Button>
          </View>
        </View>
        <View />
        <Text className="mt-6 font-sans-bold text-lg text-primary-foreground">
          Estatísticas
        </Text>
        <FlatList
          data={getHeaderStatisticItems(selectedInvestment)}
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

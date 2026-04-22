import { useAuth } from "@/context/auth.context";
import { getFirstName } from "@/shared/utils/formatName";
import { Text, View, Pressable } from "react-native";
import { DrawerActions, useNavigation } from "@react-navigation/native";

import Line from "@/assets/line.svg";
import { Menu } from "lucide-react-native";

export function HomeHeader() {
  const { user } = useAuth();
  const navigation = useNavigation();

  return (
    <View className="bg-primary h-56 rounded-b-xl p-6 py-10">
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          className="p-2"
        >
          <Menu size={24} color="#111" />
        </Pressable>
        <Text className="text-secondary font-sans-semibold text-xl">
          {getFirstName(user?.displayName || "")}
        </Text>
      </View>
      <View className="mt-2">
        <Line />
      </View>
    </View>
  );
}

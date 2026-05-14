import { Drawer } from "expo-router/drawer";
import { CreditCard, User, Users, LogOut, Home } from "lucide-react-native";
import { View, Text, Pressable } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useAuth } from "@/context/auth.context";
import Line from "@/assets/whiteLine.svg";
import { formatName } from "@/shared/utils/formatName";
import { Modal } from "@/components/Modal";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/themes/colors";

function drawerIconColor(focused: boolean) {
  return focused ? "#000000" : colors.primary;
}

export default function DrawerLayout() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: colors.background,
          borderRadius: 0,
          width: "70%",
        },
        drawerLabelStyle: {
          fontFamily: "TitilliumSemiBold",
          fontSize: 16,
          marginLeft: -4,
        },
        drawerItemStyle: {
          borderRadius: 6,
          marginHorizontal: 10,
          marginVertical: 5,
          paddingVertical: 3,
          overflow: "hidden",
        },
        drawerActiveTintColor: "#000000",
        drawerInactiveTintColor: colors.foreground,
        drawerActiveBackgroundColor: colors.primary,
        drawerInactiveBackgroundColor: "transparent",
      }}
      drawerContent={(props) => (
        <View className="flex-1 bg-background justify-between">
          <View className="flex-1 mt-24">
            <View className="p-5 px-7">
              <Text className="text-white font-sans-semibold text-xl">
                {formatName(user?.displayName || "")}
              </Text>
              <Text className="text-primary font-sans-semibold text-sm">
                {user?.email}
              </Text>
            </View>

            <DrawerContentScrollView {...props}>
              <DrawerItemList {...props} />
            </DrawerContentScrollView>
          </View>

          <View className="px-5 pt-2" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
            <Line width={250} height={20} />
            <Modal
              title="Sair da conta"
              description="Tem certeza que deseja sair da conta?"
              onConfirm={handleLogout}
              trigger={
                <Pressable className="flex-row items-center justify-center gap-2">
                  <LogOut color={colors.primary} size={18} />
                  <Text className="text-white font-sans-semibold text-lg">
                    Sair da conta
                  </Text>
                </Pressable>
              }
            />
          </View>
        </View>
      )}
    >
      <Drawer.Screen
         name="(tabs)"
         options={{
          title: "Início",
          drawerIcon: ({ focused, size }) => (
            <Home size={size} color={drawerIconColor(focused)} />
          ),
        }}
      />

      <Drawer.Screen
        name="profile"
        options={{
          title: "Perfil",
          drawerIcon: ({ focused, size }) => (
            <User size={size} color={drawerIconColor(focused)} />
          ),
        }}
      />

      <Drawer.Screen
        name="payments"
        options={{
          title: "Pagamentos",
          drawerIcon: ({ focused, size }) => (
            <CreditCard size={size} color={drawerIconColor(focused)} />
          ),
        }}
      />

      <Drawer.Screen
        name="beneficiary"
        options={{
          title: "Beneficiários",
          drawerIcon: ({ focused, size }) => (
            <Users size={size} color={drawerIconColor(focused)} />
          ),
        }}
      />
    </Drawer>
  );
}

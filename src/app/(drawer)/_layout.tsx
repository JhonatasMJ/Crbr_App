import { Drawer } from "expo-router/drawer";
import { CreditCard, User, Users, LogOut } from "lucide-react-native";
import { View, Text } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useAuth } from "@/context/auth.context";
import Line from "@/assets/whiteLine.svg";
import { formatName } from "@/shared/utils/formatName";
import { Modal } from "@/components/Modal";
import { router } from "expo-router";

export default function DrawerLayout() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: "#000",
          borderRadius: 0,
          width: "70%",
        },
        drawerLabelStyle: {
          color: "#fff",
          fontFamily: "TitilliumSemiBold",
          fontSize: 16,
        },
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#FFBF00",
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

          <View className="p-5">
            <Line width={250} height={20} />
            <Modal
              title="Sair da conta"
              description="Tem certeza que deseja sair da conta?"
              onConfirm={handleLogout}
              trigger={
                <View className="flex-row items-center justify-center gap-2">
                  <LogOut color="#FFBF00" size={18} />
                  <Text className="text-white font-sans-semibold text-lg">
                    Sair da conta
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      )}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerItemStyle: { display: "none" },
        }}
      />

      <Drawer.Screen
        name="profile"
        options={{
          title: "Perfil",
          drawerIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />

      <Drawer.Screen
        name="payments"
        options={{
          title: "Pagamentos",
          drawerIcon: ({ color, size }) => (
            <CreditCard size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="beneficiaries"
        options={{
          title: "Beneficiários",
          drawerIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
    </Drawer>
  );
}

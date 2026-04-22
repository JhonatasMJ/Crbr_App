import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: "#000",
          borderRadius: 0,
          width: "70%",
        },
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#888",
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerItemStyle: { display: "none" },
        }}
      />

      <Drawer.Screen name="profile" options={{ title: "Perfil" }} />
    </Drawer>
  );
}

import { Text, View } from "react-native";
import { useAuth } from "@/context/auth.context";

export default function Home() {
  const { user } = useAuth();
  return (
    <View>
      <Text>Home</Text>
      <Text>{user?.email}</Text>
    </View>
  );
}

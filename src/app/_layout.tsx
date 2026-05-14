import "@/styles/global.css";
import { NAV_THEME } from "@/lib/theme";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import {
  useFonts,
  TitilliumWeb_400Regular,
  TitilliumWeb_600SemiBold,
  TitilliumWeb_700Bold,
} from "@expo-google-fonts/titillium-web";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider } from "@/context/auth.context";
import { BeneficiaryProvider } from "@/context/beneficiary.context";
import { InvestmentsProvider } from "@/context/investments.context";
import "react-native-gesture-handler";
import { SnackBarContextProvider } from "@/context/snackbar.context";
import { SnackBar } from "@/components/SnackBar";
import { BottomSheetProvider } from "@/context/bottomShet.context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  const [fontsLoaded] = useFonts({
    TitilliumRegular: TitilliumWeb_400Regular,
    TitilliumSemiBold: TitilliumWeb_600SemiBold,
    TitilliumBold: TitilliumWeb_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView className="flex-1">
    <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
      <SnackBarContextProvider>
        <AuthProvider>
          <InvestmentsProvider>
            <BeneficiaryProvider>
              <BottomSheetProvider>
              <StatusBar style="light" />
              <Stack screenOptions={{ headerShown: false }} />
              <SnackBar />
              <PortalHost />
              </BottomSheetProvider>
            </BeneficiaryProvider>
          </InvestmentsProvider>
        </AuthProvider>
      </SnackBarContextProvider>
    </ThemeProvider>
    </GestureHandlerRootView>
  );
}

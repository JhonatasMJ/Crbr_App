import '@/styles/global.css';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import {
  useFonts,
  TitilliumWeb_400Regular,
  TitilliumWeb_600SemiBold,
  TitilliumWeb_700Bold,
} from '@expo-google-fonts/titillium-web';
import { ActivityIndicator, View } from 'react-native';

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
        <ActivityIndicator size="large"  className='text-primary'/>
      </View>
    );
  }

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
      <PortalHost />
    </ThemeProvider>
  );
}

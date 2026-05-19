import { AppIntroOverlay } from "@/components/AppIntroOverlay";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/auth.context";
import { getPostLoginHref } from "@/shared/utils/authRouting";

/* Carousel de boas-vindas — desativado
import { Button } from "@/components/ui/button";
import {
  Text,
  Dimensions,
  Image,
  ImageSourcePropType,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Carousel from "react-native-reanimated-carousel";
import Animated, { FadeIn } from "react-native-reanimated";
import { colors } from "@/themes/colors";
import { Link } from "expo-router";

const { width, height } = Dimensions.get("window");

type DataProps = {
  title: string;
  subtitle: string;
  img: ImageSourcePropType;
};

const data: DataProps[] = [
  {
    title: "Veja seus rendimentos",
    subtitle:
      "Monitore seus investimentos em tempo real e veja seu dinheiro crescer.",
    img: require("../assets/img1.png"),
  },
  {
    title: "Comece com facilidade",
    subtitle:
      "Crie sua conta em minutos e transforme seus planos financeiros em realidade.",
    img: require("../../assets/images/img2.png"),
  },
  {
    title: "Invista no seu Futuro.",
    subtitle:
      "Descubra oportunidades de investimento para todos os perfis. Simples, seguro e ao seu alcance.",
    img: require("../../assets/images/img2.png"),
  },
];
*/

export default function Index() {
  const [introDone, setIntroDone] = useState(false);
  const [authCheckDone, setAuthCheckDone] = useState(false);
  const {
    user,
    userProfile,
    initializing,
    getRememberedLogin,
    tryBiometricRememberedLogin,
  } = useAuth();

  useEffect(() => {
    if (user) {
      setIntroDone(true);
    }
  }, [user]);

  useEffect(() => {
    if (initializing) return;

    if (user) {
      router.replace(getPostLoginHref(user.email, userProfile?.email));
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const remembered = await getRememberedLogin();
        if (cancelled) return;
        if (remembered) {
          const loggedInWithBiometric = await tryBiometricRememberedLogin();
          if (cancelled) return;
          if (loggedInWithBiometric) return;
          router.replace({
            pathname: "/(auth)/login",
            params: { skipBiometric: "1" },
          });
          return;
        }
      } catch (e) {
        console.error(e);
      }
      if (!cancelled) setAuthCheckDone(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    initializing,
    user,
    userProfile?.email,
    getRememberedLogin,
    tryBiometricRememberedLogin,
  ]);

  useEffect(() => {
    if (!introDone || !authCheckDone || user) return;
    router.replace("/(auth)/login");
  }, [introDone, authCheckDone, user]);

  if (user) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {!introDone ? (
        <AppIntroOverlay onFinish={() => setIntroDone(true)} />
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" className="text-primary" />
        </View>
      )}
    </View>
  );
}

import { Button } from "@/components/ui/button";
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  Image,
  ImageSourcePropType,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Carousel from "react-native-reanimated-carousel";
import { colors } from "@/themes/colors";
import { Link, router, type Href } from "expo-router";
import { useAuth } from "@/context/auth.context";
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

export default function Index() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [welcomeReady, setWelcomeReady] = useState(false);
  const insets = useSafeAreaInsets();
  const { user, initializing, getRememberedLogin } = useAuth();

  useEffect(() => {
    if (initializing) return;

    if (user) {
      router.replace("/(drawer)" as Href);
      return;
    }

    setWelcomeReady(false);
    let cancelled = false;
    (async () => {
      try {
        const remembered = await getRememberedLogin();
        if (cancelled) return;
        if (remembered) {
          router.replace("/(auth)/login");
          return;
        }
      } catch (e) {
        console.error(e);
      }
      if (!cancelled) setWelcomeReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [initializing, user, getRememberedLogin]);

  const { paginationOverlayTop, slideTopPadding } = useMemo(() => {
    const paginationTopSpacing = 12;
    const barHeight = 4;
    const belowBarGap = 24;
    const top = insets.top + paginationTopSpacing;
    return {
      paginationOverlayTop: top,
      slideTopPadding: top + barHeight + belowBarGap,
    };
  }, [insets.top]);

  if (initializing || user || !welcomeReady) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  return (
    <View className="flex-1 relative">
      <Carousel
        autoPlay
        loop
        autoPlayInterval={3000}
        pagingEnabled
        width={width}
        height={height}
        data={data}
        onSnapToItem={setActiveIndex}
        renderItem={({ item }) => (
          <View className="flex-1 overflow-hidden bg-black">
            <Image
              source={item.img}
              resizeMode="cover"
              style={StyleSheet.absoluteFillObject}
              className="h-full w-full"
            />
            <View
              pointerEvents="none"
              className="absolute inset-0 bg-black/30"
            />

            <View
              className="z-10 flex-1 px-6"
              style={{
                paddingTop: slideTopPadding,
                paddingBottom: insets.bottom + 36,
              }}
            >
              <View className="items-center pb-8">
                <Image
                  source={require("../../assets/images/logo.png")}
                  className="h-40 w-40"
                  resizeMode="contain"
                />
              </View>

              <View className="flex-1 justify-center">
                <Text className="mb-2 font-sans-bold text-3xl text-primary">
                  {item.title}
                </Text>

                <Text className="font-sans text-lg text-white">
                  {item.subtitle}
                </Text>
              </View>

              <View className="mt-6 gap-6">
              <Link href="/(auth)/register" asChild>
                <Button size="xl" className="bg-primary">
                  <Text className="font-sans-bold text-lg text-secondary">
                    Criar Conta
                  </Text>
                </Button>
              </Link>

          
                <Button
                  size="xl"
                  variant="ghost"
                  className="border-2 border-primary bg-transparent"
                  onPress={() => router.push("/(auth)/login")}
                >
                  <Text className="font-sans-bold text-lg text-primary">
                    Entrar
                  </Text>
                </Button>
             
              </View>
            </View>
          </View>
        )}
      />

      <View
        pointerEvents="none"
        className="absolute left-0 right-0 z-10 flex-row gap-2 px-6"
        style={{ top: paginationOverlayTop }}
      >
        {data.map((_, i) => (
          <View
            key={i}
            className="h-1 flex-1 rounded-full"
            style={{
              backgroundColor: i === activeIndex ? colors.primary : "#444",
            }}
          />
        ))}
      </View>
    </View>
  );
}

import { Button } from "@/components/ui/button";
import React, { useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  Image,
  ImageSourcePropType,
} from "react-native";
import Carousel, {
  Pagination,
  ICarouselInstance,
} from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
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
    img: require("../../assets/images/img1.png"),
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
  const progress = useSharedValue(0);
  const ref = useRef<ICarouselInstance>(null);

  return (
    <View className="flex-1 relative">
      <Carousel
        ref={ref}
        autoPlay
        loop
        autoPlayInterval={3000}
        pagingEnabled
        width={width}
        height={height}
        data={data}
        onProgressChange={(_, absoluteProgress) => {
          progress.value = absoluteProgress;
        }}
        renderItem={({ item }) => (
          <View className="flex-1 bg-secondary relative">
            {/*     <Image
              source={item.img}
              className="w-full h-full"
              resizeMode="cover"
            /> */}

            <Image
              source={require("../../assets/images/logo.png")}
              className="w-40 h-40 absolute top-10 self-center"
              resizeMode="contain"
            />

            <View className="absolute bottom-32 left-6 right-6">
              <Text className="text-3xl font-sans-bold mb-2 text-primary">
                {item.title}
              </Text>

              <Text className="text-lg text-white font-sans">
                {item.subtitle}
              </Text>

              <View className="mt-16 gap-6">
                <Button size="xl" className="bg-primary">
                  <Text className="text-secondary font-sans-bold text-lg">
                    Criar Conta
                  </Text>
                </Button>

                <Link href="/(auth)/login" asChild>
                  <Button
                    size="xl"
                    variant="ghost"
                    className="bg-transparent border-2 border-primary"
                  >
                    <Text className="text-primary font-sans-bold text-lg">
                      Entrar
                    </Text>
                  </Button>
                </Link>
              </View>
            </View>
            <View className="absolute bottom-16 w-full items-center">
              <Pagination.Basic
                progress={progress}
                data={data}
                dotStyle={{
                  width: 25,
                  height: 4,
                  borderRadius: 4,
                  backgroundColor: "#444",
                }}
                activeDotStyle={{
                  backgroundColor: colors.primary,
                }}
                containerStyle={{
                  gap: 10,
                }}
                horizontal
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}

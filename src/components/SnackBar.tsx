import { useSnackBarContext } from "@/context/snackbar.context";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";

export function SnackBar() {
  const { message, type } = useSnackBarContext();
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [currentType, setCurrentType] = useState<typeof type>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (message && type) {
      setCurrentMessage(message);
      setCurrentType(type);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (currentMessage && currentType) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 10,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setCurrentMessage(null);
          setCurrentType(null);
        }
      });
    }
  }, [message, type, currentMessage, currentType, opacity, translateY]);

  /* Se não tiver mensagem ativa, não renderiza a snackbar */
  if (!currentMessage || !currentType) {
    return <></>;
  }

  const borderColor = currentType === "SUCCESS" ? "border-primary" : "border-red-500";

  return (
    <Animated.View
      style={{ opacity, transform: [{ translateY }] }}
      className={`bg-[#111] absolute bottom-10 self-center z-50 h-[50px] w-[90%] justify-center border-l-4 p-2 ${borderColor}`}
    >
      <Text className="text-center text-base font-bold text-white">{currentMessage}</Text>
    </Animated.View>
  );
}
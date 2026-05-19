import { Text } from "@/components/ui/text";
import { colors } from "@/themes/colors";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedText = Animated.createAnimatedComponent(Text);

const INTRO_HOLD_MS = 1400;
const INTRO_EXIT_MS = 520;

type AppIntroOverlayProps = {
  onFinish: () => void;
};

export function AppIntroOverlay({ onFinish }: AppIntroOverlayProps) {
  const insets = useSafeAreaInsets();
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const overlayOpacity = useSharedValue(1);
  const logoScale = useSharedValue(0.72);
  const logoOpacity = useSharedValue(0);
  const lineWidth = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(28);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    logoOpacity.value = withTiming(1, {
      duration: 480,
      easing: Easing.out(Easing.cubic),
    });
    logoScale.value = withSpring(1, {
      damping: 16,
      stiffness: 140,
      mass: 0.85,
    });

    lineWidth.value = withDelay(
      280,
      withTiming(1, { duration: 620, easing: Easing.out(Easing.cubic) }),
    );

    titleOpacity.value = withDelay(
      380,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }),
    );
    titleTranslateY.value = withDelay(
      380,
      withSpring(0, { damping: 18, stiffness: 160 }),
    );

    subtitleOpacity.value = withDelay(
      520,
      withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) }),
    );

    const exitDelay = INTRO_HOLD_MS + 900;

    overlayOpacity.value = withDelay(
      exitDelay,
      withTiming(0, { duration: INTRO_EXIT_MS, easing: Easing.inOut(Easing.cubic) }, (finished) => {
        if (finished) {
          runOnJS(onFinishRef.current)();
        }
      }),
    );

    logoScale.value = withDelay(
      exitDelay,
      withSequence(
        withTiming(1.04, { duration: INTRO_EXIT_MS * 0.45 }),
        withTiming(0.96, { duration: INTRO_EXIT_MS * 0.55 }),
      ),
    );
  }, [
    lineWidth,
    logoOpacity,
    logoScale,
    overlayOpacity,
    subtitleOpacity,
    titleOpacity,
    titleTranslateY,
  ]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: lineWidth.value }],
    opacity: lineWidth.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, overlayStyle]}
      className="z-50 bg-background"
    >
      <View
        className="flex-1 items-center justify-center px-8"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <View className="items-center">
          <Animated.View style={logoStyle}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.View style={[styles.line, lineStyle]} />

          <AnimatedText
            style={[titleStyle, styles.title]}
            className="text-center font-sans-bold text-2xl text-white"
          >
            CRBR Investimentos
          </AnimatedText>

          <AnimatedText
            style={[subtitleStyle, styles.subtitle]}
            className="mt-2 text-center font-sans text-base text-zinc-500"
          >
            Seu patrimônio, com clareza
          </AnimatedText>
        </View>
      </View>

      <View
        pointerEvents="none"
        className="absolute bottom-0 left-0 right-0 items-center"
        style={{ paddingBottom: insets.bottom + 28 }}
      >
        <View className="h-1 w-1 rounded-full bg-primary/80" />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 128,
    height: 128,
  },
  line: {
    height: 2,
    width: 120,
    marginTop: 28,
    marginBottom: 20,
    borderRadius: 1,
    backgroundColor: colors.primary,
  },
  title: {
    fontFamily: "TitilliumBold",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: "TitilliumRegular",
    maxWidth: 260,
  },
});

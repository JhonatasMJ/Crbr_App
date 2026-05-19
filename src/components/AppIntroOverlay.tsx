import { Text } from "@/components/ui/text";
import { colors } from "@/themes/colors";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedText = Animated.createAnimatedComponent(Text);

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

const LOGO_IN_MS = 720;
const LABEL_IN_MS = 560;
const TAGLINE_IN_MS = 480;
const PROGRESS_MS = 2800;
const EXIT_MS = 520;
const EXIT_DELAY_MS = 3000;

const PROGRESS_TRACK_WIDTH = Dimensions.get("window").width - 80;

type AppIntroOverlayProps = {
  onFinish: () => void;
};

export function AppIntroOverlay({ onFinish }: AppIntroOverlayProps) {
  const insets = useSafeAreaInsets();
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const overlayOpacity = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.94);
  const labelOpacity = useSharedValue(0);
  const labelTranslateY = useSharedValue(14);
  const taglineOpacity = useSharedValue(0);
  const progress = useSharedValue(0);
  const contentOpacity = useSharedValue(1);
  const contentTranslateY = useSharedValue(0);

  useEffect(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    logoOpacity.value = withTiming(1, {
      duration: LOGO_IN_MS,
      easing: EASE_OUT,
    });
    logoScale.value = withTiming(1, {
      duration: LOGO_IN_MS,
      easing: EASE_OUT,
    });

    labelOpacity.value = withDelay(
      220,
      withTiming(1, { duration: LABEL_IN_MS, easing: EASE_OUT }),
    );
    labelTranslateY.value = withDelay(
      220,
      withTiming(0, { duration: LABEL_IN_MS, easing: EASE_OUT }),
    );

    taglineOpacity.value = withDelay(
      420,
      withTiming(1, { duration: TAGLINE_IN_MS, easing: EASE_OUT }),
    );

    progress.value = withDelay(
      320,
      withTiming(1, { duration: PROGRESS_MS, easing: EASE_IN_OUT }),
    );

    contentOpacity.value = withDelay(
      EXIT_DELAY_MS,
      withTiming(0, { duration: EXIT_MS, easing: EASE_IN_OUT }),
    );
    contentTranslateY.value = withDelay(
      EXIT_DELAY_MS,
      withTiming(-10, { duration: EXIT_MS, easing: EASE_IN_OUT }),
    );

    overlayOpacity.value = withDelay(
      EXIT_DELAY_MS + 80,
      withTiming(
        0,
        { duration: EXIT_MS + 120, easing: EASE_IN_OUT },
        (finished) => {
          if (finished) {
            runOnJS(onFinishRef.current)();
          }
        },
      ),
    );
  }, [
    contentOpacity,
    contentTranslateY,
    labelOpacity,
    labelTranslateY,
    logoOpacity,
    logoScale,
    overlayOpacity,
    progress,
    taglineOpacity,
  ]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    transform: [{ translateY: labelTranslateY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: progress.value * PROGRESS_TRACK_WIDTH,
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, overlayStyle]}
      className="z-50 bg-background"
    >
      <View
        className="flex-1 items-center justify-center px-10"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Animated.View style={[styles.content, contentStyle]}>
          <Animated.View style={logoStyle}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          <AnimatedText
            style={[labelStyle, styles.brandLabel]}
            className="mt-8 text-center font-sans-bold text-2xl text-white"
          >
            CRBR Investimentos
          </AnimatedText>

          <AnimatedText
            style={[taglineStyle, styles.tagline]}
            className="mt-3 text-center text-[15px] leading-5 text-zinc-600"
          >
            Seu patrimônio, com clareza
          </AnimatedText>
        </Animated.View>
      </View>

      <View
        className="absolute left-10 right-10"
        style={{ bottom: insets.bottom + 36 }}
      >
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    width: "100%",
  },
  logo: {
    width: 96,
    height: 96,
  },
  brandLabel: {
    fontFamily: "TitilliumBold",
    fontSize: 26,
    lineHeight: 32,
    color: "#FFFFFF",
  },
  tagline: {
    fontFamily: "TitilliumRegular",
    maxWidth: 280,
  },
  progressTrack: {
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 1,
    backgroundColor: colors.primary,
  },
});

import { Text } from "@/components/ui/text";
import { APP_VERSION } from "@/shared/constants/appVersion";
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
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedText = Animated.createAnimatedComponent(Text);

const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

const LOGO_GROW_MS = 1000;
const LOGO_SETTLE_MS = 380;
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
  const logoScale = useSharedValue(0.42);
  const labelOpacity = useSharedValue(0);
  const labelTranslateY = useSharedValue(14);
  const taglineOpacity = useSharedValue(0);
  const versionOpacity = useSharedValue(0);
  const progress = useSharedValue(0);
  const contentOpacity = useSharedValue(1);
  const contentTranslateY = useSharedValue(0);

  useEffect(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    logoOpacity.value = withTiming(1, {
      duration: 520,
      easing: EASE_OUT,
    });

    logoScale.value = withSequence(
      withTiming(1.08, {
        duration: LOGO_GROW_MS,
        easing: Easing.out(Easing.back(1.15)),
      }),
      withTiming(1, {
        duration: LOGO_SETTLE_MS,
        easing: EASE_IN_OUT,
      }),
      withDelay(
        200,
        withRepeat(
          withSequence(
            withTiming(1.035, {
              duration: 1100,
              easing: EASE_IN_OUT,
            }),
            withTiming(1, {
              duration: 1100,
              easing: EASE_IN_OUT,
            }),
          ),
          -1,
          true,
        ),
      ),
    );

    labelOpacity.value = withDelay(
      520,
      withTiming(1, { duration: LABEL_IN_MS, easing: EASE_OUT }),
    );
    labelTranslateY.value = withDelay(
      520,
      withTiming(0, { duration: LABEL_IN_MS, easing: EASE_OUT }),
    );

    taglineOpacity.value = withDelay(
      680,
      withTiming(1, { duration: TAGLINE_IN_MS, easing: EASE_OUT }),
    );

    versionOpacity.value = withDelay(
      860,
      withTiming(1, { duration: 400, easing: EASE_OUT }),
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
    versionOpacity,
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

  const versionStyle = useAnimatedStyle(() => ({
    opacity: versionOpacity.value,
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
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 48,
          marginTop: -24,
        }}
      >
        <Animated.View style={[styles.content, contentStyle]}>
          <Animated.View style={[styles.logoWrap, logoStyle]}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          <AnimatedText
            style={[labelStyle, styles.brandLabel]}
            className="text-center font-sans-bold text-white"
          >
            CRBR Investimentos
          </AnimatedText>

          <AnimatedText
            style={[taglineStyle, styles.tagline]}
            className="text-center text-zinc-500"
          >
            Deixe seu dinheiro trabalhar por você
          </AnimatedText>
        </Animated.View>
      </View>

      <View
        className="absolute left-10 right-10 items-center"
        style={{ bottom: insets.bottom + 28 }}
      >
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
        <AnimatedText style={[versionStyle, styles.version]}>
          v{APP_VERSION}
        </AnimatedText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 148,
    height: 148,
  },
  brandLabel: {
    fontFamily: "TitilliumBold",
    fontSize: 28,
    lineHeight: 34,
    color: "#FFFFFF",
    letterSpacing: 0.2,
    marginTop: 36,
  },
  tagline: {
    fontFamily: "TitilliumRegular",
    fontSize: 16,
    lineHeight: 24,
    color: "#71717a",
    maxWidth: 300,
    marginTop: 16,
    textAlign: "center",
  },
  progressTrack: {
    width: "100%",
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
  version: {
    fontFamily: "TitilliumRegular",
    fontSize: 12,
    lineHeight: 16,
    color: "#FFBF00",
    marginTop: 12,
    textAlign: "center",
  },
});

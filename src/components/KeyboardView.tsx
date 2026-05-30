import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type KeyboardViewProps = {
  children: ReactNode;
  className?: string;
  contentContainerClassName?: string;
  scrollable?: boolean;
};

export function KeyboardView({
  children,
  className,
  contentContainerClassName,
  scrollable = true,
}: KeyboardViewProps) {
  const scrollContent = (
    <KeyboardAwareScrollView
      enableOnAndroid
      enableAutomaticScroll
      enableResetScrollToCoords={false}
      extraScrollHeight={Platform.OS === "android" ? 100 : 32}
      extraHeight={Platform.OS === "android" ? 100 : 32}
      keyboardOpeningTime={0}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      scrollEnabled={scrollable}
      className={cn("flex-1", className)}
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
      contentContainerClassName={contentContainerClassName}
    >
      {children}
    </KeyboardAwareScrollView>
  );

  if (Platform.OS === "android") {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1">{scrollContent}</View>
      </TouchableWithoutFeedback>
    );
  }

  return (
    <KeyboardAvoidingView className="flex-1" behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1">{scrollContent}</View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

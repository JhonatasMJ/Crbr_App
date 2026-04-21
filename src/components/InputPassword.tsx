import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react-native";
import type { FieldValues } from "react-hook-form";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { InputLabel, type InputLabelProps } from "./InputLabel";

export function InputPassword<TFieldValues extends FieldValues>(
  props: InputLabelProps<TFieldValues>
) {
  const [passwordView, setPasswordView] = useState(false);
  return (
    <View>
      <InputLabel
        {...props}
        className={cn("relative", props.className)}
        secureTextEntry={!passwordView}
      />
      <TouchableOpacity
        className="absolute right-4 bottom-4"
        onPress={() => setPasswordView((v) => !v)}
      >
        {passwordView ? (
          <Eye color="#444" size={18} />
        ) : (
          <EyeOff color="#444" size={18} />
        )}
      </TouchableOpacity>
    </View>
  );
}

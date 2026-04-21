import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { Eye, EyeOff } from "lucide-react-native";
import type { FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "./ErrorMessage";
import type { InputLabelProps } from "./InputLabel";

export function InputPassword<TFieldValues extends FieldValues>(
  props: InputLabelProps<TFieldValues>
) {
  const [passwordView, setPasswordView] = useState(false);
  const { label, control, name, ...inputRest } = props;

  return (
    <View>
      <Text className="text-primary font-sans-semibold text-xl mb-1">
        {label}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <View className="relative w-full">
              <Input
                {...inputRest}
                secureTextEntry={!passwordView}
                value={value ?? ""}
                onChangeText={onChange}
                className={cn("pr-11", inputRest.className)}
              />
              <View
                pointerEvents="box-none"
                className="absolute bottom-0 right-2 top-0 justify-center"
              >
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={
                    passwordView ? "Ocultar senha" : "Mostrar senha"
                  }
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  onPress={() => setPasswordView((v) => !v)}
                >
                  {passwordView ? (
                    <Eye color="#444" size={18} />
                  ) : (
                    <EyeOff color="#444" size={18} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {error ? <ErrorMessage>{error.message}</ErrorMessage> : null}
          </>
        )}
      />
    </View>
  );
}

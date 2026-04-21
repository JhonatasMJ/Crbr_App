import { Text } from "@/components/ui/text";
import { View } from "react-native";
import { Input } from "@/components/ui/input";
import type { ComponentProps } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";
import { ErrorMessage } from "./ErrorMessage";

export type InputLabelProps<TFieldValues extends FieldValues> = {
  label: string;
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
} & ComponentProps<typeof Input>;

export function InputLabel<TFieldValues extends FieldValues>({
  label,
  control,
  name,
  ...inputRest
}: InputLabelProps<TFieldValues>) {
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
            <Input {...inputRest} value={value ?? ""} onChangeText={onChange} />

            {error ? <ErrorMessage>{error.message}</ErrorMessage> : null}
          </>
        )}
      />
    </View>
  );
}

import { ErrorMessage } from "@/components/ErrorMessage";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import CurrencyInput from "react-native-currency-input";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Platform, TextInput, View } from "react-native";

const inputClassName = cn(
  "text-foreground flex-1 min-w-0 py-2 text-base leading-5",
  Platform.select({
    web: "outline-none md:text-sm",
    native: "placeholder:text-white",
  }),
);

type CurrencyInputLabelProps<TFieldValues extends FieldValues> = {
  label: string;
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
};

export function CurrencyInputLabel<TFieldValues extends FieldValues>({
  label,
  control,
  name,
}: CurrencyInputLabelProps<TFieldValues>) {
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
            <View className="flex-row items-center border-b-2 border-input min-h-11">
              <Text className="text-foreground text-base mr-1">R$</Text>
              <CurrencyInput
                value={typeof value === "number" ? value : null}
                onChangeValue={(amount) => onChange(amount ?? null)}
                delimiter="."
                separator=","
                precision={2}
                keyboardType="decimal-pad"
                placeholder="0,00"
                renderTextInput={(props) => (
                  <TextInput
                    {...props}
                    className={cn(inputClassName, props.className)}
                  />
                )}
              />
            </View>
            {error ? <ErrorMessage>{error.message}</ErrorMessage> : null}
          </>
        )}
      />
    </View>
  );
}

import { ErrorMessage } from "@/components/ErrorMessage";
import { Text } from "@/components/ui/text";
import { colors } from "@/themes/colors";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react-native";
import { useState } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Modal, Pressable, View } from "react-native";

export type SelectOption = {
  label: string;
  value: string;
};

const fieldClassName =
  "min-h-11 flex-row items-center justify-between border-b-2 border-input py-2";

type SelectInputLabelProps<TFieldValues extends FieldValues> = {
  label: string;
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  options: readonly SelectOption[];
  placeholder?: string;
};

export function SelectInputLabel<TFieldValues extends FieldValues>({
  label,
  control,
  name,
  options,
  placeholder = "Selecione uma opção",
}: SelectInputLabelProps<TFieldValues>) {
  return (
    <View>
      <Text className="text-primary font-sans-semibold text-xl mb-1">
        {label}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <ModalSelectField
            value={value}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            error={error?.message}
          />
        )}
      />
    </View>
  );
}

type ModalSelectFieldProps = {
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder: string;
  error?: string;
};

function ModalSelectField({
  value,
  onChange,
  options,
  placeholder,
  error,
}: ModalSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  function handleSelect(option: SelectOption) {
    onChange(option.value);
    setOpen(false);
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        className={fieldClassName}
      >
        <Text
          className={cn(
            "flex-1 text-base leading-5",
            selected ? "text-foreground" : "text-zinc-500",
          )}
        >
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown size={20} color="#A3A3A3" />
      </Pressable>

      {error ? <ErrorMessage>{error}</ErrorMessage> : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/60 px-6"
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="w-full max-w-sm rounded-xl bg-black p-4"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="gap-2">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelect(option)}
                    className={cn(
                      "min-h-12 flex-row items-center justify-between rounded-lg px-4 py-3",
                      isSelected ? "bg-primary/20" : "active:bg-foreground/10",
                    )}
                  >
                    <Text
                      className={cn(
                        "text-base font-sans-semibold",
                        isSelected ? "text-primary" : "text-white",
                      )}
                    >
                      {option.label}
                    </Text>
                    {isSelected ? (
                      <Check size={20} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

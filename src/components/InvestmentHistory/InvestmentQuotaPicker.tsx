import { Text } from "@/components/ui/text";
import { colors } from "@/themes/colors";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import type { QuotaOption } from "@/shared/utils/investment-history/quotaOptions";

type InvestmentQuotaPickerProps = {
  options: QuotaOption[];
  value?: string;
  onChange: (id: string) => void;
};

export function InvestmentQuotaPicker({
  options,
  value,
  onChange,
}: InvestmentQuotaPickerProps) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => options.find((o) => o.id === value),
    [options, value],
  );

  const placeholder = "Selecione uma cota";

  return (
    <View>
      <Text className="mb-2 font-sans-semibold text-sm text-zinc-400">
        Cota
      </Text>
      <Pressable
        onPress={() => options.length > 0 && setOpen(true)}
        disabled={options.length === 0}
        className={cn(
          "min-h-12 flex-row items-center justify-between rounded-md bg-zinc-900/50 px-4 py-3",
          options.length === 0 && "opacity-50",
        )}
      >
        <View className="min-w-0 flex-1 pr-2">
          <Text
            className={cn(
              "font-sans-semibold text-base",
              selected ? "text-white" : "text-zinc-500",
            )}
            numberOfLines={1}
          >
            {selected?.label ?? placeholder}
          </Text>
          {selected?.isArchived ? (
            <Text className="mt-0.5 font-sans text-xs text-zinc-500">
              Encerrada
            </Text>
          ) : null}
        </View>
        <ChevronDown size={20} color={colors.primary} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/70"
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="max-h-[70%] rounded-t-md bg-background px-4 pb-8 pt-4"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="mb-4 font-sans-bold text-lg text-white">
              Escolher cota
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => {
                const isSelected = option.id === value;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => {
                      onChange(option.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "mb-2 flex-row items-center justify-between rounded-lg border px-4 py-3",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-zinc-800 bg-zinc-900/40",
                    )}
                  >
                    <View className="min-w-0 flex-1 pr-2">
                      <Text
                        className="font-sans-semibold text-base text-white"
                        numberOfLines={2}
                      >
                        {option.label}
                      </Text>
                      {option.isArchived ? (
                        <Text className="mt-0.5 font-sans text-xs text-zinc-500">
                          Cota encerrada
                        </Text>
                      ) : null}
                    </View>
                    {isSelected ? (
                      <Check size={20} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

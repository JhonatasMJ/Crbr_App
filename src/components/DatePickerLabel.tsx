import "@/shared/utils/calendarLocale";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { colors } from "@/themes/colors";
import { cn } from "@/lib/utils";
import {
  formatBrDate,
  fromCalendarKey,
  toCalendarKey,
} from "@/shared/utils/investmentDates";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";

const fieldClassName =
  "text-foreground min-h-11 py-2 text-base leading-5 border-b-2 border-input";

const calendarTheme = {
  backgroundColor: colors.background,
  calendarBackground: colors.background,
  textSectionTitleColor: colors.foreground,
  selectedDayBackgroundColor: colors.primary,
  selectedDayTextColor: colors.secondary,
  todayTextColor: colors.primary,
  dayTextColor: colors.foreground,
  textDisabledColor: "#525252",
  monthTextColor: colors.foreground,
  arrowColor: colors.primary,
  dotColor: colors.primary,
  indicatorColor: colors.primary,
};

type DatePickerLabelProps = {
  label: string;
  value: Date;
  onChange?: (date: Date) => void;
  readOnly?: boolean;
  className?: string;
};

export function DatePickerLabel({
  label,
  value,
  onChange,
  readOnly = false,
  className,
}: DatePickerLabelProps) {
  const [open, setOpen] = useState(false);
  const [pendingKey, setPendingKey] = useState(() => toCalendarKey(value));

  useEffect(() => {
    if (open) setPendingKey(toCalendarKey(value));
  }, [open, value]);

  const markedDates = useMemo(
    () => ({
      [pendingKey]: {
        selected: true,
        selectedColor: colors.primary,
      },
    }),
    [pendingKey],
  );

  function handleDayPress(day: DateData) {
    setPendingKey(day.dateString);
  }

  function handleConfirm() {
    onChange?.(fromCalendarKey(pendingKey));
    setOpen(false);
  }

  return (
    <View className={cn("flex-1", className)}>
      <Text className="text-primary font-sans-semibold text-xl mb-1">
        {label}
      </Text>
      {readOnly ? (
        <Text className={fieldClassName}>{formatBrDate(value)}</Text>
      ) : (
        <Pressable onPress={() => setOpen(true)}>
          <Text className={fieldClassName}>{formatBrDate(value)}</Text>
        </Pressable>
      )}

      {!readOnly ? (
        <Modal
          visible={open}
          transparent
          animationType="fade"
          onRequestClose={() => setOpen(false)}
        >
          <Pressable
            className="flex-1 items-center justify-center bg-black/70 px-4"
            onPress={() => setOpen(false)}
          >
            <Pressable
              className="w-full max-w-md rounded-xl border border-zinc-800 bg-black p-4"
              onPress={(e) => e.stopPropagation()}
            >
              <Calendar
                current={pendingKey}
                onDayPress={handleDayPress}
                markedDates={markedDates}
                theme={calendarTheme}
                enableSwipeMonths
                firstDay={0}
              />

              <View className="mt-4 flex-row gap-3">
                <Button
                  className="h-11 flex-1 bg-red-500"
                  onPress={() => setOpen(false)}
                >
                  <Text className="text-center font-sans-semibold text-white">
                    Cancelar
                  </Text>
                </Button>
                <Button
                  className="h-11 flex-1 bg-primary"
                  onPress={handleConfirm}
                >
                  <Text className="text-center font-sans-semibold text-black">
                    Confirmar
                  </Text>
                </Button>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

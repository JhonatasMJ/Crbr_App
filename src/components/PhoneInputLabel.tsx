import { ErrorMessage } from "@/components/ErrorMessage";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DEFAULT_COUNTRY_ID,
  PHONE_COUNTRIES_BY_NAME,
  composeStoredPhone,
  getCountryById,
  parseStoredPhone,
  type PhoneCountry,
} from "@/shared/utils/phoneCountries";
import { maskPhoneNational } from "@/shared/utils/masks/phoneMask";
import { ChevronDown } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";
import {
  FlatList,
  Modal,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "./ui/button";

const ROW_CLASS =
  "border-b-2 border-input flex min-h-11 w-full flex-row items-center rounded-xs py-2 shadow-sm shadow-black/5 sm:min-h-9";

const INPUT_IN_ROW_CLASS =
  "min-h-0 flex-1 min-w-0 border-0 pb-2 pt-2 shadow-none";

function flagEmoji(iso: string): string {
  if (iso.length !== 2) return "";
  return String.fromCodePoint(
    ...[...iso.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)),
  );
}

type InnerProps = {
  value: string;
  onChange: (v: string) => void;
};

function PhoneField({ value, onChange }: InnerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pickerCountryId, setPickerCountryId] = useState(DEFAULT_COUNTRY_ID);

  const parsed = useMemo(() => parseStoredPhone(value ?? ""), [value]);

  const activeCountry = useMemo(() => {
    const v = value?.trim() ?? "";
    if (v.startsWith("+")) {
      return parsed.country;
    }
    return getCountryById(pickerCountryId) ?? parsed.country;
  }, [value, parsed.country, pickerCountryId]);

  const nationalDigits = useMemo(() => {
    const v = value?.trim() ?? "";
    if (!v.startsWith("+")) return "";
    return parsed.nationalRaw.replace(/\D/g, "");
  }, [value, parsed.nationalRaw]);

  const displayNational = useMemo(
    () => maskPhoneNational(activeCountry, nationalDigits),
    [activeCountry, nationalDigits],
  );

  const maskFunction = useMemo(
    () => (raw: string) => maskPhoneNational(activeCountry, raw),
    [activeCountry.id],
  );

  useEffect(() => {
    if (value?.trim().startsWith("+")) {
      setPickerCountryId(parsed.country.id);
    }
  }, [value, parsed.country.id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PHONE_COUNTRIES_BY_NAME;
    return PHONE_COUNTRIES_BY_NAME.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.iso.toLowerCase().includes(q),
    );
  }, [query]);

  const pickCountry = (c: PhoneCountry) => {
    setPickerCountryId(c.id);
    setModalOpen(false);
    setQuery("");
    onChange(composeStoredPhone(c, nationalDigits));
  };

  return (
    <>
      <View className={cn(ROW_CLASS)}>
        <TouchableOpacity
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Escolher país"
          className="mr-3 flex-row items-center gap-1 border-r border-input pr-3"
          onPress={() => setModalOpen(true)}
        >
          <Text className="text-lg">{flagEmoji(activeCountry.iso)}</Text>
          <Text className="text-base text-foreground">+{activeCountry.dial}</Text>
          <ChevronDown size={18} color="#A3A3A3" />
        </TouchableOpacity>

        <Input
          key={activeCountry.id}
          maskFunction={maskFunction}
          value={displayNational}
          onChangeText={(formatted) =>
            onChange(composeStoredPhone(activeCountry, formatted))
          }
          keyboardType="phone-pad"
          placeholder="Digite seu telefone"
          placeholderTextColor="#737373"
          className={INPUT_IN_ROW_CLASS}
        />
      </View>

      <Modal
        visible={modalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalOpen(false)}
      >
        <View className="flex-1 bg-background px-4 pt-14">
          <Text className="mb-4 font-sans-semibold text-2xl text-primary">
            País ou região
          </Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar país ou código..."
            placeholderTextColor="#737373"
            className="mb-4 rounded-md border border-input px-3 py-2 text-base text-foreground"
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                className="flex-row items-center gap-3 border-b border-input py-3"
                onPress={() => pickCountry(item)}
              >
                <Text className="text-xl">{flagEmoji(item.iso)}</Text>
                <Text className="flex-1 text-base text-foreground">
                  {item.name}
                </Text>
                <Text className="text-base text-foreground">+{item.dial}</Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text className="py-8 text-center text-muted-foreground">
                Nenhum país encontrado
              </Text>
            }
          />
          <Button className="mb-8 mt-4 bg-primary py-2" onPress={() => setModalOpen(false)}>
            <Text className="text-center font-sans-bold text-lg text-black ">
              Fechar
            </Text>
          </Button>
        </View>
      </Modal>
    </>
  );
}

type PhoneInputLabelProps<T extends FieldValues> = {
  label: string;
  control: Control<T>;
  name: Path<T>;
};

export function PhoneInputLabel<T extends FieldValues>({
  label,
  control,
  name,
}: PhoneInputLabelProps<T>) {
  return (
    <View>
      <Text className="mb-1 font-sans-semibold text-xl text-primary">
        {label}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <PhoneField value={value ?? ""} onChange={onChange} />
            {error ? <ErrorMessage>{error.message}</ErrorMessage> : null}
          </>
        )}
      />
    </View>
  );
}
 
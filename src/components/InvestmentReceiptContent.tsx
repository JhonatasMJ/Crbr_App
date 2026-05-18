import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Download, X } from "lucide-react-native";
import LogoYellow from "@/assets/logoYellowSvg.svg";
import { Text } from "@/components/ui/text";
import type { InvestmentReceiptData } from "@/types/investmentReceipt";
import {
  buildInvestmentReceiptLayout,
  shareInvestmentReceiptPdf,
} from "@/shared/pdf";
import { useSnackBarContext } from "@/context/snackbar.context";
import { colors } from "@/themes/colors";

type InvestmentReceiptContentProps = {
  receipt: InvestmentReceiptData;
  onDone: () => void;
};

function ReceiptRow({
  label,
  value,
  highlightValue,
}: {
  label: string;
  value: string;
  highlightValue?: boolean;
}) {
  return (
    <View className="flex-row items-start justify-between border-b border-zinc-800 px-6 py-4">
      <Text className="shrink font-sans-bold text-base text-foreground">
        {label}
      </Text>
      <Text
        className={`ml-4 max-w-[55%] flex-1 text-right font-sans text-base ${
          highlightValue ? "font-sans-bold text-primary" : "text-zinc-400"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}

function ReceiptSectionTitle({ title }: { title: string }) {
  return (
    <View className="border-b border-zinc-800 bg-secondary px-6 py-2.5">
      <Text className="font-sans-semibold text-sm text-zinc-500">{title}</Text>
    </View>
  );
}

export function InvestmentReceiptContent({
  receipt,
  onDone,
}: InvestmentReceiptContentProps) {
  const { notify } = useSnackBarContext();
  const insets = useSafeAreaInsets();
  const [downloading, setDownloading] = useState(false);
  const layout = buildInvestmentReceiptLayout(receipt);

  async function handleDownloadPdf() {
    try {
      setDownloading(true);
      await shareInvestmentReceiptPdf(receipt);
    } catch (error) {
      console.error(error);
      notify({
        message: "Não foi possível gerar o PDF",
        messageType: "ERROR",
      });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <View className="flex-1 bg-background">
      <View
        className="flex-row items-center justify-between border-b border-zinc-800 px-5 pb-3"
        style={{ paddingTop: Math.max(insets.top, 12) }}
      >
        <LogoYellow width={44} height={44} />
        <View className="flex-row items-center gap-1">
          <Pressable
            onPress={handleDownloadPdf}
            disabled={downloading}
            hitSlop={12}
            className="h-11 w-11 items-center justify-center"
          >
            {downloading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Download size={22} color={colors.primary} />
            )}
          </Pressable>
          <Pressable
            onPress={onDone}
            disabled={downloading}
            hitSlop={12}
            className="h-11 w-11 items-center justify-center"
          >
            <X size={24} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="border-b border-zinc-800 px-6 pb-5 pt-6">
          <Text className="font-sans-bold text-2xl leading-8 text-foreground">
            {layout.title}
          </Text>
          <Text className="mt-2 font-sans text-sm uppercase tracking-wide text-zinc-500">
            {layout.timestamp}
          </Text>
        </View>

        {layout.headerRows.map((row) => (
          <ReceiptRow
            key={row.label}
            label={row.label}
            value={row.value}
            highlightValue={row.label === "Valor"}
          />
        ))}

        {layout.sections.map((section) => (
          <View key={section.title}>
            <ReceiptSectionTitle title={section.title} />
            {section.rows.map((row) => (
              <ReceiptRow key={row.label} label={row.label} value={row.value} />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

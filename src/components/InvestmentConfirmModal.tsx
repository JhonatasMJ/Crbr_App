import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { INVESTMENT_STATUS } from "@/shared/constants/investmentStatus";
import { formatInvestmentAmount } from "@/shared/utils/formatInvestmentAmount";
import { ActivityIndicator, Modal, Pressable, View } from "react-native";

export type InvestmentConfirmSummary = {
  investmentName: string;
  investmentAmount: number;
  duration: string;
  durationLabel: string;
  startDate: string;
  endDate: string;
  pixNumber: string;
};

type InvestmentConfirmModalProps = {
  visible: boolean;
  summary: InvestmentConfirmSummary | null;
  submitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-4 py-2 border-b border-zinc-800">
      <Text className="font-sans-medium text-sm text-zinc-400">{label}</Text>
      <Text className="flex-1 text-right font-sans-semibold text-sm text-white">
        {value}
      </Text>
    </View>
  );
}

export function InvestmentConfirmModal({
  visible,
  summary,
  submitting = false,
  onCancel,
  onConfirm,
}: InvestmentConfirmModalProps) {
  if (!summary) return null;

  const pixDisplay = summary.pixNumber.trim() || "—";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/70 px-6"
        onPress={onCancel}
      >
        <Pressable
          className="w-full max-w-sm rounded-xl bg-black p-5 border border-zinc-800"
          onPress={(e) => e.stopPropagation()}
        >
          <Text className="mb-2 text-center font-sans-bold text-xl text-white">
            Confirmar investimento
          </Text>
          <Text className="mb-5 text-center font-sans text-sm text-zinc-400">
            Este investimento não poderá ser editado após a confirmação.
          </Text>

          <View className="mb-5 rounded-md bg-zinc-900/80 px-3">
            <SummaryRow label="Cota" value={summary.investmentName} />
            <SummaryRow
              label="Valor"
              value={formatInvestmentAmount(summary.investmentAmount)}
            />
            <SummaryRow label="Tipo" value={summary.durationLabel} />
            <SummaryRow label="Início" value={summary.startDate} />
            <SummaryRow label="Vencimento" value={summary.endDate} />
            <SummaryRow label="Chave Pix" value={pixDisplay} />
            <SummaryRow label="Status" value={INVESTMENT_STATUS.PENDING} />
          </View>

          <View className="flex-row gap-3">
            <Button
              className="h-11 flex-1 bg-red-500"
              disabled={submitting}
              onPress={onCancel}
            >
              <Text className="text-center font-sans-semibold text-white">
                Cancelar
              </Text>
            </Button>
            <Button
              className="h-11 flex-1 bg-primary"
              disabled={submitting}
              onPress={onConfirm}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#111" />
              ) : (
                <Text className="text-center font-sans-semibold text-black">
                  Confirmar
                </Text>
              )}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

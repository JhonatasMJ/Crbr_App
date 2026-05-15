import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Text, View } from "react-native";
import { CurrencyInputLabel } from "../CurrencyInputLabel";
import { DatePickerLabel } from "../DatePickerLabel";
import { InputLabel } from "../InputLabel";
import { SelectInputLabel } from "../SelectInputLabel";
import { InvestmentConfirmModal } from "../InvestmentConfirmModal";
import type { InvestmentConfirmSummary } from "../InvestmentConfirmModal";
import { Button } from "../ui/button";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  INVESTMENT_DURATION_OPTIONS,
  investmentsSchema,
  type InvestmentFormValues,
} from "@/shared/schemas/investments";
import { formatBrDate, getEndDate } from "@/shared/utils/investmentDates";
import { useInvestments } from "@/context/investments.context";
import { useSnackBarContext } from "@/context/snackbar.context";
import { useRouter } from "expo-router";
import type { Resolver } from "react-hook-form";

const defaultFormValues: InvestmentFormValues = {
  duration: "4 meses",
  investmentAmount: null,
  investmentName: "",
  pixNumber: "",
};

export function InvestmentsForm() {
  const { createInvestment } = useInvestments();
  const { notify } = useSnackBarContext();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmSummary, setConfirmSummary] =
    useState<InvestmentConfirmSummary | null>(null);
  const [startDate, setStartDate] = useState(() => new Date());
  const [formKey, setFormKey] = useState(0);

  const { control, handleSubmit, reset } = useForm<InvestmentFormValues>({
    defaultValues: defaultFormValues,
    resolver: yupResolver(investmentsSchema) as Resolver<InvestmentFormValues>,
  });

  function clearForm() {
    reset(defaultFormValues);
    setStartDate(new Date());
    setFormKey((k) => k + 1);
  }

  const duration = useWatch({ control, name: "duration" });
  const endDate = useMemo(
    () => getEndDate(startDate, duration ?? "4 meses"),
    [startDate, duration],
  );

  function openConfirmModal(data: InvestmentFormValues) {
    if (data.investmentAmount == null) return;

    const durationLabel =
      INVESTMENT_DURATION_OPTIONS.find((o) => o.value === data.duration)
        ?.label ?? data.duration;

    setConfirmSummary({
      investmentName: data.investmentName.trim(),
      investmentAmount: data.investmentAmount,
      duration: data.duration,
      durationLabel,
      startDate: formatBrDate(startDate),
      endDate: formatBrDate(endDate),
      pixNumber: data.pixNumber.trim(),
    });
    setConfirmOpen(true);
  }

  async function handleConfirmInvest() {
    if (!confirmSummary) return;

    try {
      setSubmitting(true);
      await createInvestment({
        investmentName: confirmSummary.investmentName,
        investmentAmount: confirmSummary.investmentAmount,
        duration: confirmSummary.duration as InvestmentFormValues["duration"],
        pixNumber: confirmSummary.pixNumber,
        startDate: confirmSummary.startDate,
        endDate: confirmSummary.endDate,
      });
      setConfirmOpen(false);
      setConfirmSummary(null);
      clearForm();
      notify({
        message: "Investimento criado com sucesso",
        messageType: "SUCCESS",
      });
      router.back();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancelConfirm() {
    if (submitting) return;
    setConfirmOpen(false);
    setConfirmSummary(null);
  }

  return (
    <>
      <View key={formKey} className="gap-8 pb-8">
        <InputLabel
          control={control}
          name="investmentName"
          label="Nome da cota"
          placeholder="Ex.: Cota 2"
        />

        <CurrencyInputLabel
          control={control}
          name="investmentAmount"
          label="Valor do investimento"
        />

        <SelectInputLabel
          control={control}
          name="duration"
          label="Tipo de investimento"
          placeholder="Selecione o tipo"
          options={INVESTMENT_DURATION_OPTIONS}
        />

        <View className="flex-row gap-4">
          <DatePickerLabel
            label="Data de início"
            value={startDate}
            onChange={setStartDate}
          />
          <DatePickerLabel label="Data final" value={endDate} readOnly />
        </View>

        <InputLabel
          control={control}
          name="pixNumber"
          label="Chave Pix"
          placeholder="Digite sua chave pix"
        />

        <Button
          className="bg-primary"
          size="xl"
          disabled={submitting}
          onPress={handleSubmit(openConfirmModal)}
        >
          <Text className="font-sans-bold text-lg">Investir</Text>
        </Button>
      </View>

      <InvestmentConfirmModal
        visible={confirmOpen}
        summary={confirmSummary}
        submitting={submitting}
        onCancel={handleCancelConfirm}
        onConfirm={handleConfirmInvest}
      />
    </>
  );
}

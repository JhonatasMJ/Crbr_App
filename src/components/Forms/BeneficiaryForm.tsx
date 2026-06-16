import type { BeneficiaryFormValues } from "@/shared/schemas/beneficiaryForm";
import { maskCPF } from "@/shared/utils/masks/cpfMask";
import type { Control } from "react-hook-form";
import { View } from "react-native";
import { InputLabel } from "../InputLabel";

type BeneficiaryFormProps = {
  control: Control<BeneficiaryFormValues>;
  maxPercentage: number;
};

export function BeneficiaryForm({
  control,
  maxPercentage,
}: BeneficiaryFormProps) {
  return (
    <View className="gap-4">
      <InputLabel
        control={control}
        name="name"
        label="Nome completo"
        placeholder="Nome do beneficiário"
      />
      <InputLabel
        control={control}
        name="cpf"
        label="CPF"
        maskFunction={maskCPF}
        placeholder="000.000.000-00"
        keyboardType="number-pad"
      />
      <InputLabel
        control={control}
        name="percentage"
        label="Percentual (%)"
        placeholder={`Até ${maxPercentage}%`}
        keyboardType="decimal-pad"
      />
    </View>
  );
}

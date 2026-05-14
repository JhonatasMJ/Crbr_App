import { BeneficiaryForm } from "@/components/Forms/BeneficiaryForm";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useBeneficiary } from "@/context/beneficiary.context";
import { useBottomSheetContext } from "@/context/bottomShet.context";
import { useSnackBarContext } from "@/context/snackbar.context";
import {
  beneficiaryFormSchema,
  type BeneficiaryFormValues,
} from "@/shared/schemas/beneficiaryForm";
import { maskCPF, onlyNumbers } from "@/shared/utils/masks/cpfMask";
import type { Beneficiary } from "@/types/beneficiary";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";

type BeneficiarySheetContentProps = {
  maxPercentage: number;
  beneficiaryToEdit?: Beneficiary | null;
};

export function BeneficiarySheetContent({
  maxPercentage,
  beneficiaryToEdit = null,
}: BeneficiarySheetContentProps) {
  const { addBeneficiary, updateBeneficiary } = useBeneficiary();
  const { notify } = useSnackBarContext();
  const { closeBottomSheet } = useBottomSheetContext();
  const [submitting, setSubmitting] = useState(false);

  const { control, reset, handleSubmit } = useForm<BeneficiaryFormValues>({
    defaultValues: { name: "", cpf: "", percentage: "" },
    resolver: yupResolver(beneficiaryFormSchema),
  });

  useEffect(() => {
    if (beneficiaryToEdit) {
      reset({
        name: beneficiaryToEdit.name,
        cpf: maskCPF(beneficiaryToEdit.cpf),
        percentage: String(beneficiaryToEdit.percentage).replace(".", ","),
      });
    } else {
      reset({ name: "", cpf: "", percentage: "" });
    }
  }, [beneficiaryToEdit, reset]);

  async function onSubmit(data: BeneficiaryFormValues) {
    const pct = Number(String(data.percentage).replace(",", "."));
    if (pct > maxPercentage) {
      notify({
        message: `Percentual máximo permitido é ${maxPercentage}%.`,
        messageType: "ERROR",
      });
      return;
    }
    try {
      setSubmitting(true);
      if (beneficiaryToEdit) {
        await updateBeneficiary(beneficiaryToEdit.id, {
          name: data.name.trim(),
          cpf: onlyNumbers(data.cpf),
          percentage: pct,
        });
        notify({
          message: "Beneficiário atualizado com sucesso",
          messageType: "SUCCESS",
        });
      } else {
        await addBeneficiary({
          name: data.name.trim(),
          cpf: onlyNumbers(data.cpf),
          percentage: pct,
        });
        notify({
          message: "Beneficiário adicionado com sucesso",
          messageType: "SUCCESS",
        });
      }
      closeBottomSheet();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  const isEdit = Boolean(beneficiaryToEdit);

  return (
    <View className="px-6 pb-8 pt-2">
      <Text className="mb-4 font-sans-bold text-xl text-white">
        {isEdit ? "Editar beneficiário" : "Adicionar beneficiário"}
      </Text>

      <BeneficiaryForm control={control} maxPercentage={maxPercentage} />

      <View className="mt-6 w-full flex-row gap-2">
        <Button
          className="h-11 flex-1 bg-red-500 active:bg-red-600"
          disabled={submitting}
          onPress={closeBottomSheet}
        >
          <Text className="text-center font-sans-semibold text-white">
            Cancelar
          </Text>
        </Button>
        <Button
          className="h-11 flex-1 bg-primary"
          disabled={submitting}
          onPress={handleSubmit(onSubmit)}
        >
          <Text className="text-center font-sans-semibold text-black">
            {submitting ? "Salvando..." : "Salvar"}
          </Text>
        </Button>
      </View>
    </View>
  );
}

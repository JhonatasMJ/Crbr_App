import { useBeneficiary } from "@/context/beneficiary.context";
import { useSnackBarContext } from "@/context/snackbar.context";
import {
  beneficiaryFormSchema,
  type BeneficiaryFormValues,
} from "@/shared/schemas/beneficiaryForm";
import { onlyNumbers } from "@/shared/utils/masks/cpfMask";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { BeneficiaryForm } from "./Forms/BeneficiaryForm";

type ModalBeneficiaryProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxPercentage: number;
};

export function ModalBeneficiary({
  open,
  onOpenChange,
  maxPercentage,
}: ModalBeneficiaryProps) {
  const { addBeneficiary } = useBeneficiary();
  const { notify } = useSnackBarContext();
  const [submitting, setSubmitting] = useState(false);

  const { control, reset, handleSubmit } = useForm<BeneficiaryFormValues>({
    defaultValues: { name: "", cpf: "", percentage: "" },
    resolver: yupResolver(beneficiaryFormSchema),
  });

  useEffect(() => {
    if (!open) return;
    reset({ name: "", cpf: "", percentage: "" });
  }, [open, reset]);

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
      await addBeneficiary({
        name: data.name.trim(),
        cpf: onlyNumbers(data.cpf),
        percentage: pct,
      });
      notify({
        message: "Beneficiário adicionado com sucesso",
        messageType: "SUCCESS",
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-full">
        <BeneficiaryForm
          control={control}
          maxPercentage={maxPercentage}
        />

        <DialogFooter className="w-full flex-row gap-2">
          <Button
            className="h-11 flex-1 bg-red-500 active:bg-red-600"
            disabled={submitting}
            onPress={() => onOpenChange(false)}
          >
            <Text className="text-center  text-white font-sans-semibold">Cancelar</Text>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

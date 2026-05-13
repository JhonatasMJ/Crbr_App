import * as yup from "yup";
import { onlyNumbers } from "@/shared/utils/masks/cpfMask";

export type BeneficiaryFormValues = {
  name: string;
  cpf: string;
  percentage: string;
};

export const beneficiaryFormSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Nome é obrigatório")
    .min(2, "Nome muito curto"),
  cpf: yup
    .string()
    .required("CPF é obrigatório")
    .test("digits", "CPF deve ter 11 dígitos", (v) => onlyNumbers(v ?? "").length === 11),
  percentage: yup
    .string()
    .required("Percentual é obrigatório")
    .test("pct", "Informe um percentual entre 1 e 100", (v) => {
      const n = Number(String(v).replace(",", "."));
      return !Number.isNaN(n) && n >= 1 && n <= 100;
    }),
});

import * as yup from "yup";
import { formatAmountPlain } from "@/shared/utils/formatInvestmentAmount";

export const INVESTMENT_MIN_AMOUNT = 1000;
export const INVESTMENT_MAX_AMOUNT = 150_000;

export const INVESTMENT_DURATION_OPTIONS = [
  { label: "4 meses", value: "4 meses" },
  { label: "Anual", value: "anual" },
] as const;

export type InvestmentFormValues = {
  investmentName: string;
  investmentAmount: number | null;
  duration: (typeof INVESTMENT_DURATION_OPTIONS)[number]["value"];
  pixNumber: string;
};

export const investmentsSchema = yup.object({
  investmentName: yup.string().trim().required("Nome da cota é obrigatório"),
  investmentAmount: yup
    .number()
    .nullable()
    .test("required", "Valor é obrigatório", (v) => v != null)
    .test(
      "min",
      `Valor mínimo é R$ ${formatAmountPlain(INVESTMENT_MIN_AMOUNT)}`,
      (v) => v != null && v >= INVESTMENT_MIN_AMOUNT,
    )
    .test(
      "max",
      `Valor máximo é R$ ${formatAmountPlain(INVESTMENT_MAX_AMOUNT)}`,
      (v) => v != null && v <= INVESTMENT_MAX_AMOUNT,
    ),
  duration: yup
    .string()
    .required()
    .oneOf(INVESTMENT_DURATION_OPTIONS.map((o) => o.value)),
  pixNumber: yup.string().default(""),
});

import * as yup from "yup";
import { formatAmountPlain } from "@/shared/utils/formatInvestmentAmount";

export type InvestmentActionAmountValues = {
  amount: number | null;
};

export function createInvestmentActionAmountSchema(maxAmount: number) {
  return yup.object({
    amount: yup
      .number()
      .nullable()
      .test("required", "Informe o valor", (v) => v != null)
      .test("min", "Valor deve ser maior que zero", (v) => v != null && v > 0)
      .test(
        "max",
        `Valor máximo é R$ ${formatAmountPlain(maxAmount)}`,
        (v) => v != null && v <= maxAmount,
      ),
  });
}

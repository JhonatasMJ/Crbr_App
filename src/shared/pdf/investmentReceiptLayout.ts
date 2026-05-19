import type { InvestmentReceiptData } from "@/types/investmentReceipt";
import { formatInvestmentAmount } from "@/shared/utils/formatInvestmentAmount";

export type ReceiptRowData = { label: string; value: string };

export type ReceiptSectionData = {
  title: string;
  rows: ReceiptRowData[];
};

const MONTH_LABELS = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
] as const;

export function buildInvestmentReceiptFileName(
  personName?: string,
  receiptKind: InvestmentReceiptData["receiptKind"] = "investment",
): string {
  const name = personName?.trim() || "Investidor";
  const safeName = name
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const prefix =
    receiptKind === "request" ? "Compro. Solicitação" : "Compro. Investimento";

  return `${prefix} - ${safeName || "Investidor"}.pdf`;
}

export function formatReceiptTimestamp(
  createdDate: string,
  createdTime: string,
): string {
  const [day, month, year] = createdDate.split("/");
  const monthIndex = Number(month) - 1;
  const monthLabel = MONTH_LABELS[monthIndex] ?? month?.toUpperCase() ?? "";
  return `${day} ${monthLabel} ${year} - ${createdTime}`;
}

export function buildInvestmentReceiptLayout(receipt: InvestmentReceiptData) {
  const pixDisplay = receipt.pixNumber.trim() || "—";
  const investor = receipt.investorName?.trim() || "—";
  const investorEmail = receipt.investorEmail?.trim() || "—";
  const isRequest = receipt.receiptKind === "request";
  const operationLabel = receipt.operationLabel?.trim() || "Investimento";

  return {
    title: isRequest
      ? "Comprovante de solicitação"
      : "Comprovante de investimento",
    timestamp: formatReceiptTimestamp(receipt.createdDate, receipt.createdTime),
    headerRows: [
      { label: "Valor", value: formatInvestmentAmount(receipt.investmentAmount) },
      { label: "Tipo de operação", value: operationLabel },
      { label: "Status", value: receipt.status },
    ] satisfies ReceiptRowData[],
    sections: [
      {
        title: "Investimento",
        rows: [
          { label: "Cota", value: receipt.investmentName },
          { label: "Tipo", value: receipt.durationLabel },
          { label: "Início", value: receipt.startDate },
          { label: "Vencimento", value: receipt.endDate },
        ],
      },
      {
        title: "Pagamento",
        rows: [
          { label: "Forma de pagamento", value: receipt.paymentMethod },
          { label: "Chave Pix", value: pixDisplay },
        ],
      },
      {
        title: "Investidor",
        rows: [
          { label: "Nome", value: investor },
          { label: "E-mail", value: investorEmail },
        ],
      },
    ] satisfies ReceiptSectionData[],
  };
}

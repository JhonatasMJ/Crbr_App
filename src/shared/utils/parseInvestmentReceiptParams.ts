import type { InvestmentReceiptData } from "@/types/investmentReceipt";

export function serializeInvestmentReceipt(
  receipt: InvestmentReceiptData,
): string {
  return JSON.stringify(receipt);
}

export function parseInvestmentReceiptParam(
  data: string | string[] | undefined,
): InvestmentReceiptData | null {
  const raw = Array.isArray(data) ? data[0] : data;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as InvestmentReceiptData;
    if (
      typeof parsed.investmentId !== "string" ||
      typeof parsed.investmentName !== "string" ||
      typeof parsed.investmentAmount !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

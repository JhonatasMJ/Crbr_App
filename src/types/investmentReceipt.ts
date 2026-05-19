export type InvestmentReceiptKind = "investment" | "request";

export type InvestmentReceiptData = {
  investmentId: string;
  investmentName: string;
  investmentAmount: number;
  durationLabel: string;
  startDate: string;
  endDate: string;
  pixNumber: string;
  status: string;
  paymentMethod: string;
  createdDate: string;
  createdTime: string;
  investorName?: string;
  investorEmail?: string;
  /** Padrão: comprovante de investimento. */
  receiptKind?: InvestmentReceiptKind;
  /** Ex.: Saque total, Saque de rendimento, Reinvestimento */
  operationLabel?: string;
};

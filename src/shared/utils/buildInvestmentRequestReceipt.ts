import type { User } from "firebase/auth";
import { INVESTMENT_STATUS } from "@/shared/constants/investmentStatus";
import type { InvestmentReceiptData } from "@/types/investmentReceipt";
import type { InvestmentPendingActionType } from "@/types/investmentPendingAction";
import type { InvestmentsParams } from "@/types/investmentsParams";
import { formatBrDate, formatBrTime } from "@/shared/utils/investmentDates";

const REQUEST_STATUS: Record<InvestmentPendingActionType, string> = {
  "withdraw-full": INVESTMENT_STATUS.WAITING_WITHDRAW,
  "withdraw-partial": INVESTMENT_STATUS.WAITING_EARNINGS,
  reinvest: INVESTMENT_STATUS.WAITING_REINVEST,
};

const OPERATION_LABEL: Record<InvestmentPendingActionType, string> = {
  "withdraw-full": "Saque total",
  "withdraw-partial": "Saque de rendimento",
  reinvest: "Reinvestimento",
};

export function buildInvestmentRequestReceipt(
  investment: InvestmentsParams,
  actionType: InvestmentPendingActionType,
  amount: number,
  user?: User | null,
): InvestmentReceiptData {
  const now = new Date();

  return {
    investmentId: investment.id ?? "",
    investmentName: investment.investmentName || investment.name || "—",
    investmentAmount: amount,
    durationLabel: investment.duration?.trim() || "4 meses",
    startDate: investment.startDate,
    endDate: investment.endDate,
    pixNumber: investment.pixNumber?.trim() ?? "",
    status: REQUEST_STATUS[actionType],
    paymentMethod: investment.paymentMethod?.trim() || "Pix",
    createdDate: formatBrDate(now),
    createdTime: formatBrTime(now),
    investorName: user?.displayName ?? undefined,
    investorEmail: user?.email ?? undefined,
    receiptKind: "request",
    operationLabel: OPERATION_LABEL[actionType],
  };
}

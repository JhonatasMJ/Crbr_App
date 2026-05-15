import {
  BanknoteIcon,
  CalendarDays,
  ChartNoAxesCombined,
  LucideIcon,
} from "lucide-react-native";
import { InvestmentsParams } from "@/types/investmentsParams";
import { formatInvestmentAmount } from "./formatInvestmentAmount";
import { getInvestmentIncome } from "./calculateInvestmentIncome";

export type StatisticListItem = {
  id: string;
  title: string;
  value: string;
  icon: LucideIcon;
};

export function getHeaderStatisticItems(
  investment: InvestmentsParams | undefined
): StatisticListItem[] {
  const empty = "—";

  if (!investment) {
    return [
      { id: "investido", title: "Investido", value: empty, icon: BanknoteIcon },
      { id: "Renda Atual", title: "Renda Atual", value: empty, icon: BanknoteIcon },
      { id: "tipo", title: "Tipo", value: empty, icon: ChartNoAxesCombined },
      { id: "vencimento", title: "Vencimento", value: empty, icon: CalendarDays },
    ];
  }

  return [
    {
      id: "investido",
      title: "Investido",
      value: formatInvestmentAmount(investment.investmentAmount || investment.amount),
      icon: BanknoteIcon,
    },
    {
      id: "renda-atual",
      title: "Renda Atual",
      value: formatInvestmentAmount(getInvestmentIncome(investment)),
      icon: BanknoteIcon,
    },
    {
      id: "tipo",
      title: "Tipo",
      value: investment.duration?.trim() || empty,
      icon: ChartNoAxesCombined,
    },
    {
      id: "vencimento",
      title: "Vencimento",
      value: investment.endDate?.trim() || empty,
      icon: CalendarDays,
    },
  ];
}

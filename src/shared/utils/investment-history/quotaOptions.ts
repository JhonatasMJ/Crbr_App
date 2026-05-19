import type { InvestmentsParams } from "@/types/investmentsParams";
import type { DeletedInvestmentArchive } from "@/types/investmentTimeline";

export type QuotaOption = {
  id: string;
  label: string;
  isArchived: boolean;
};

function resolveLabel(
  name?: string,
  fallback = "Investimento",
): string {
  return name?.trim() || fallback;
}

export function buildQuotaOptions(
  investments: InvestmentsParams[],
  deletedArchives: DeletedInvestmentArchive[],
): QuotaOption[] {
  const active: QuotaOption[] = investments
    .filter((item) => item.id)
    .map((item) => ({
      id: item.id!,
      label: resolveLabel(item.investmentName ?? item.name),
      isArchived: false,
    }));

  const archived: QuotaOption[] = deletedArchives.map((item) => ({
    id: item.id,
    label: resolveLabel(
      item.investmentName ?? item.name,
      "Cota encerrada",
    ),
    isArchived: true,
  }));

  return [...active, ...archived];
}

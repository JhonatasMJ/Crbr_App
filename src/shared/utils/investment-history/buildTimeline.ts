import type { InvestmentAmountHistoryEntry } from "@/types/investmentAmountHistory";
import type {
  InvestmentsParams,
  InvestmentWithdrawalEntry,
} from "@/types/investmentsParams";
import type {
  DeletedInvestmentArchive,
  InvestmentTimelineEvent,
  LegacyInvestmentHistoryEntry,
} from "@/types/investmentTimeline";
import { formatEventLabel } from "./formatEventLabel";
import { capitalizeWords } from "@/shared/utils/formatName";

function resolveInvestmentName(investment: Pick<InvestmentsParams, "name" | "investmentName">) {
  return (
    capitalizeWords(investment.investmentName) ||
    capitalizeWords(investment.name) ||
    "Investimento"
  );
}

function formatDisplayAmount(amount?: string): string {
  if (!amount?.trim()) return "—";
  const trimmed = amount.trim();
  if (trimmed.startsWith("R$")) return trimmed;
  return `R$ ${trimmed}`;
}

function fromAmountHistoryEntry(
  entry: InvestmentAmountHistoryEntry,
  index: number,
  ctx: { investmentId?: string; investmentName: string; isArchived?: boolean },
): InvestmentTimelineEvent {
  const timestamp =
    typeof entry.createdAt === "number" ? entry.createdAt : Date.now();
  return {
    id: `${ctx.investmentId ?? "inv"}-amount-${index}-${timestamp}`,
    investmentId: ctx.investmentId,
    investmentName: ctx.investmentName,
    type: entry.type,
    label: formatEventLabel(entry.type),
    amount: formatDisplayAmount(entry.amount),
    date: entry.createdDate,
    time: entry.createdTime,
    description:
      entry.description?.trim() || formatEventLabel(entry.type),
    timestamp,
    isArchived: ctx.isArchived,
  };
}

function fromLegacyHistoryEntry(
  key: string,
  entry: LegacyInvestmentHistoryEntry,
  ctx: { investmentId?: string; investmentName: string; isArchived?: boolean },
): InvestmentTimelineEvent | null {
  const type = entry.type?.trim() || "evento";
  const timestamp =
    typeof entry.timestamp === "number"
      ? entry.timestamp
      : typeof entry.date === "string"
        ? Date.parse(entry.date.split("/").reverse().join("-")) || 0
        : 0;

  if (!timestamp && !entry.date) return null;

  return {
    id: `${ctx.investmentId ?? "inv"}-legacy-${key}`,
    investmentId: ctx.investmentId,
    investmentName: ctx.investmentName,
    type,
    label: formatEventLabel(type),
    amount: formatDisplayAmount(entry.amount),
    date: entry.date ?? "—",
    time: entry.time,
    description: entry.notes?.trim() || formatEventLabel(type),
    timestamp: timestamp || 0,
    isArchived: ctx.isArchived,
  };
}

function parseBrDate(date?: string): number {
  if (!date) return 0;
  return Date.parse(date.split("/").reverse().join("-")) || 0;
}

/**
 * Saques totais marcados pelo dashboard: lista `withdrawals` (um por saque) ou,
 * em registros antigos, os campos `withdrawn*` — mesma regra do dashboard.
 */
function listDashboardWithdrawals(
  investment: InvestmentsParams,
): InvestmentWithdrawalEntry[] {
  if (Array.isArray(investment.withdrawals) && investment.withdrawals.length > 0) {
    return investment.withdrawals.filter((w) => w && typeof w === "object");
  }
  if (investment.withdrawn && investment.withdrawnAmount && investment.withdrawnDate) {
    return [
      {
        amount: investment.withdrawnAmount,
        date: investment.withdrawnDate,
        time: investment.withdrawnTime,
        createdAt: investment.withdrawnAt,
        description: "Saque total da cota",
      },
    ];
  }
  return [];
}

function fromDashboardWithdrawals(
  investment: InvestmentsParams,
  ctx: { investmentId?: string; investmentName: string; isArchived?: boolean },
  existing: InvestmentTimelineEvent[],
): InvestmentTimelineEvent[] {
  // O app registra "Saque total" no amountHistory ao concluir um saque pedido por ele;
  // se o dashboard marcou o mesmo saque (mesma data), mostra só uma vez.
  const loggedDates = new Set(
    existing
      .filter((e) => formatEventLabel(e.type) === "Saque total")
      .map((e) => e.date),
  );

  return listDashboardWithdrawals(investment)
    .filter((w) => !loggedDates.has(w.date))
    .map((w, index) => {
      const timestamp =
        typeof w.createdAt === "number" ? w.createdAt : parseBrDate(w.date);
      return {
        id: `${ctx.investmentId ?? "inv"}-withdrawal-${index}-${timestamp}`,
        investmentId: ctx.investmentId,
        investmentName: ctx.investmentName,
        type: "Saque total",
        label: formatEventLabel("Saque total"),
        amount: formatDisplayAmount(w.amount),
        date: w.date || "—",
        time: w.time,
        description: w.description?.trim() || "Saque total da cota",
        timestamp,
        isArchived: ctx.isArchived,
      };
    });
}

export function collectInvestmentTimelineEvents(
  investment: InvestmentsParams,
  options?: { isArchived?: boolean },
): InvestmentTimelineEvent[] {
  const investmentName = resolveInvestmentName(investment);
  const ctx = {
    investmentId: investment.id,
    investmentName,
    isArchived: options?.isArchived,
  };

  const events: InvestmentTimelineEvent[] = [];

  for (const [index, entry] of (investment.amountHistory ?? []).entries()) {
    events.push(fromAmountHistoryEntry(entry, index, ctx));
  }

  const legacyHistory = investment.history;

  if (legacyHistory && typeof legacyHistory === "object") {
    for (const [key, entry] of Object.entries(legacyHistory)) {
      if (!entry || typeof entry !== "object") continue;
      const normalized = fromLegacyHistoryEntry(key, entry, ctx);
      if (normalized) events.push(normalized);
    }
  }

  const withdrawals = fromDashboardWithdrawals(investment, ctx, events);

  if (!events.length && investment.createdAt) {
    const timestamp =
      typeof investment.createdAt === "number"
        ? investment.createdAt
        : Number(investment.createdAt) || 0;
    if (timestamp) {
      events.push({
        id: `${investment.id ?? "inv"}-created`,
        investmentId: investment.id,
        investmentName,
        type: "criacao",
        label: "Investimento criado",
        amount: formatDisplayAmount(
          investment.investmentAmount ?? investment.amount,
        ),
        date: investment.createdDate ?? "—",
        time: investment.createdTime,
        description: "Registro inicial do investimento",
        timestamp,
        isArchived: options?.isArchived,
      });
    }
  }

  events.push(...withdrawals);

  return events;
}

export function collectDeletedInvestmentTimelineEvents(
  archive: DeletedInvestmentArchive,
): InvestmentTimelineEvent[] {
  const investmentName =
    capitalizeWords(archive.investmentName) ||
    capitalizeWords(archive.name) ||
    "Cota encerrada";

  const events: InvestmentTimelineEvent[] = [];

  if (archive.history && typeof archive.history === "object") {
    for (const [key, entry] of Object.entries(archive.history)) {
      if (!entry || typeof entry !== "object") continue;
      const normalized = fromLegacyHistoryEntry(key, entry, {
        investmentId: archive.id,
        investmentName,
        isArchived: true,
      });
      if (normalized) events.push(normalized);
    }
  }

  if (typeof archive.archivedAt === "number") {
    const hasExclusao = events.some(
      (e) => e.type.toLowerCase() === "exclusao",
    );
    if (!hasExclusao) {
      events.push({
        id: `${archive.id}-archived`,
        investmentId: archive.id,
        investmentName,
        type: "exclusao",
        label: "Cota excluída",
        amount: formatDisplayAmount(archive.investmentAmount),
        date: "—",
        description: "Cota arquivada — histórico preservado",
        timestamp: archive.archivedAt,
        isArchived: true,
      });
    }
  }

  return events;
}

export function buildAccountInvestmentTimeline(
  investments: InvestmentsParams[],
  deletedArchives: DeletedInvestmentArchive[],
): InvestmentTimelineEvent[] {
  const events: InvestmentTimelineEvent[] = [];

  for (const investment of investments) {
    events.push(...collectInvestmentTimelineEvents(investment));
  }

  for (const archive of deletedArchives) {
    events.push(...collectDeletedInvestmentTimelineEvents(archive));
  }

  return events.sort((a, b) => b.timestamp - a.timestamp);
}

export function buildInvestmentTimeline(
  investmentId: string,
  investments: InvestmentsParams[],
  deletedArchives: DeletedInvestmentArchive[],
): InvestmentTimelineEvent[] {
  const active = investments.find((i) => i.id === investmentId);
  const archived = deletedArchives.find((a) => a.id === investmentId);

  const events: InvestmentTimelineEvent[] = [];

  if (active) {
    events.push(...collectInvestmentTimelineEvents(active));
  }

  if (archived) {
    events.push(...collectDeletedInvestmentTimelineEvents(archived));
  }

  return events.sort((a, b) => b.timestamp - a.timestamp);
}

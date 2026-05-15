import type { InvestmentsParams } from "@/types/investmentsParams";
import { isInvestmentActive } from "@/shared/constants/investmentStatus";
import { isValid, parse } from "date-fns";
import { BR_DATE_FORMAT } from "@/shared/utils/investmentDates";

const TOTAL_INCOME_RATE = 0.1;

type CalculateInvestmentIncomeParams = {
  amount?: string | number;
  startDate?: string;
  endDate?: string;
  duration?: string;
  today?: Date;
};

function parseAmount(value?: string | number): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const parsedAmount = Number(
    String(value ?? "0").replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")
  );

  return Number.isFinite(parsedAmount) ? parsedAmount : 0;
}

/** Valor aplicado (principal) de um investimento. */
export function getInvestmentPrincipal(investment: InvestmentsParams): number {
  return parseAmount(investment.investmentAmount || investment.amount);
}

/** Renda proporcional — só quando o status é Ativo. */
export function getInvestmentIncome(investment: InvestmentsParams): number {
  if (!isInvestmentActive(investment.status)) return 0;

  const principal = getInvestmentPrincipal(investment);
  return calculateInvestmentIncome({
    amount: principal,
    startDate: investment.startDate,
    endDate: investment.endDate,
    duration: investment.duration,
  });
}

/** Principal + renda (renda zerada se não estiver Ativo). */
export function getInvestmentBalance(investment: InvestmentsParams): number {
  return getInvestmentPrincipal(investment) + getInvestmentIncome(investment);
}

export function investmentToCardItem(investment: InvestmentsParams) {
  return {
    id: investment.id,
    name: investment.investmentName || investment.name,
    amount: getInvestmentBalance(investment),
  };
}

function parseDate(value?: string): Date | null {
  if (!value) return null;

  const normalized = value.trim();
  const parsed = parse(normalized, BR_DATE_FORMAT, new Date());
  if (isValid(parsed)) return parsed;

  const fallbackDate = new Date(normalized);
  return isValid(fallbackDate) ? fallbackDate : null;
}

function getDurationMonths(duration?: string): number | null {
  if (!duration) return null;

  const normalized = duration
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("anual")) {
    return 12;
  }

  if (/^4\s*mes(es)?$/.test(normalized) || normalized.includes("4 meses")) {
    return 4;
  }

  return null;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/** Mesmo intervalo usado no rendimento: início → fim (endDate explícito tem prioridade). */
function resolveInvestmentPeriod(
  startDate?: string,
  endDate?: string,
  duration?: string
): { start: Date; end: Date } | null {
  const start = parseDate(startDate);
  if (!start) return null;

  const parsedEndDate = parseDate(endDate);
  const durationMonths = getDurationMonths(duration);

  let end: Date | null = null;
  if (parsedEndDate && parsedEndDate.getTime() > start.getTime()) {
    end = parsedEndDate;
  } else if (durationMonths != null) {
    const fromDuration = addMonths(start, durationMonths);
    if (fromDuration.getTime() > start.getTime()) end = fromDuration;
  }

  if (!end) return null;
  return { start, end };
}

export type InvestmentProgressInfo = {
  /** 0–100, tempo decorrido no período. */
  progressPercent: number;
  /** Dias até o vencimento (0 se já passou). */
  daysRemaining: number;
};

export function getInvestmentProgressInfo(
  params: Pick<InvestmentsParams, "startDate" | "endDate" | "duration" | "status">,
  today = new Date()
): InvestmentProgressInfo | null {
  if (params.status != null && !isInvestmentActive(params.status)) return null;

  const period = resolveInvestmentPeriod(
    params.startDate,
    params.endDate,
    params.duration
  );
  if (!period) return null;

  const { start, end } = period;
  const totalMs = end.getTime() - start.getTime();
  const t = today.getTime();

  const progressRatio = Math.min(Math.max((t - start.getTime()) / totalMs, 0), 1);
  const remainingMs = end.getTime() - t;
  const daysRemaining =
    remainingMs <= 0 ? 0 : Math.ceil(remainingMs / 86_400_000);

  return {
    progressPercent: Math.round(progressRatio * 100),
    daysRemaining,
  };
}

/** Menos dias até o vencimento primeiro; sem período válido por último. */
export function compareInvestmentsByDaysRemaining(
  a: InvestmentsParams,
  b: InvestmentsParams
): number {
  const pa = getInvestmentProgressInfo({
    startDate: a.startDate,
    endDate: a.endDate,
    duration: a.duration,
    status: a.status,
  });
  const pb = getInvestmentProgressInfo({
    startDate: b.startDate,
    endDate: b.endDate,
    duration: b.duration,
    status: b.status,
  });
  const da = pa?.daysRemaining ?? Number.MAX_SAFE_INTEGER;
  const db = pb?.daysRemaining ?? Number.MAX_SAFE_INTEGER;
  if (da !== db) return da - db;
  return (a.id ?? "").localeCompare(b.id ?? "");
}

export function calculateInvestmentIncome({
  amount,
  startDate,
  endDate,
  duration,
  today = new Date(),
}: CalculateInvestmentIncomeParams): number {
  const parsedAmount = parseAmount(amount);
  const period = resolveInvestmentPeriod(startDate, endDate, duration);

  if (!parsedAmount || !period) return 0;

  const { start, end } = period;
  const totalIncome = parsedAmount * TOTAL_INCOME_RATE;
  const totalDurationMs = end.getTime() - start.getTime();

  const elapsedMs = Math.min(
    Math.max(today.getTime() - start.getTime(), 0),
    totalDurationMs
  );

  const currentIncome = totalIncome * (elapsedMs / totalDurationMs);

  return Number(currentIncome.toFixed(2));
}

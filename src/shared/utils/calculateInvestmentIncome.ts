const TOTAL_INCOME_RATE = 0.1;

type CalculateInvestmentIncomeParams = {
  amount?: string | number;
  startDate?: string;
  endDate?: string;
  duration?: string;
  today?: Date;
};

function parseAmount(value?: string | number): number {
  const rawAmount = String(value ?? "0");
  const parsedAmount = Number(
    rawAmount.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")
  );

  return Number.isFinite(parsedAmount) ? parsedAmount : 0;
}

function parseDate(value?: string): Date | null {
  if (!value) return null;

  const normalized = value.trim();
  const ddmmyyyyMatch = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));

    return Number.isNaN(date.getTime()) ? null : date;
  }

  const fallbackDate = new Date(normalized);
  return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
}

function getDurationMonths(duration?: string): number | null {
  if (!duration) return null;

  const normalized = duration
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("trimestral") || normalized.includes("trismestral")) {
    return 3;
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

export function calculateInvestmentIncome({
  amount,
  startDate,
  endDate,
  duration,
  today = new Date(),
}: CalculateInvestmentIncomeParams): number {
  const parsedAmount = parseAmount(amount);
  const start = parseDate(startDate);
  const parsedEndDate = parseDate(endDate);
  const durationMonths = getDurationMonths(duration);
  const end =
    start && durationMonths ? addMonths(start, durationMonths) : parsedEndDate;

  if (!parsedAmount || !start || !end) return 0;

  const totalIncome = parsedAmount * TOTAL_INCOME_RATE;
  const totalDurationMs = end.getTime() - start.getTime();

  if (totalDurationMs <= 0) return 0;

  const elapsedMs = Math.min(
    Math.max(today.getTime() - start.getTime(), 0),
    totalDurationMs
  );

  const currentIncome = totalIncome * (elapsedMs / totalDurationMs);

  return Number(currentIncome.toFixed(2));
}

import { addDays, addMonths, format, getDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export const BR_DATE_FORMAT = "dd/MM/yyyy";
export const BR_TIME_FORMAT = "HH:mm:ss";

export function formatBrDate(date: Date): string {
  return format(date, BR_DATE_FORMAT, { locale: ptBR });
}

export function formatBrTime(date: Date): string {
  return format(date, BR_TIME_FORMAT, { locale: ptBR });
}

function monthsFromDuration(duration: string): number {
  const normalized = duration.toLowerCase();
  if (normalized.includes("anual")) return 12;
  return 4;
}

/** Datas bloqueadas todo ano (formato MM-dd). */
const BLOCKED_DATES = ["01-01", "05-01", "10-12", "11-02", "11-15", "12-25"];

function isBlockedDate(date: Date): boolean {
  return BLOCKED_DATES.includes(format(date, "MM-dd"));
}

export function isBusinessDay(date: Date): boolean {
  const day = getDay(date);
  return day !== 0 && day !== 6 && !isBlockedDate(date);
}

export function nextBusinessDay(date: Date): Date {
  let result = date;
  while (!isBusinessDay(result)) result = addDays(result, 1);
  return result;
}

/**
 * Sábado → sexta; domingo → segunda; data bloqueada (ex.: 01/01) → dia seguinte.
 * Se o ajuste cair em outro dia bloqueado, avança até o próximo dia útil.
 */
export function adjustEndDateForBlockedDays(date: Date): Date {
  if (isBusinessDay(date)) return date;
  if (getDay(date) === 6 && !isBlockedDate(date)) {
    const friday = subDays(date, 1);
    if (isBusinessDay(friday)) return friday;
  }
  return nextBusinessDay(addDays(date, 1));
}

export function getEndDate(start: Date, duration: string): Date {
  const rawEnd = addMonths(start, monthsFromDuration(duration));
  return adjustEndDateForBlockedDays(rawEnd);
}

export function toCalendarKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function fromCalendarKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

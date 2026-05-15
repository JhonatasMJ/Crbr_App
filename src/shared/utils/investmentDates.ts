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

/** Sábado → sexta; domingo → segunda. */
export function adjustEndDateForWeekend(date: Date): Date {
  const day = getDay(date);
  if (day === 6) return subDays(date, 1);
  if (day === 0) return addDays(date, 1);
  return date;
}

export function getEndDate(start: Date, duration: string): Date {
  const rawEnd = addMonths(start, monthsFromDuration(duration));
  return adjustEndDateForWeekend(rawEnd);
}

export function toCalendarKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function fromCalendarKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

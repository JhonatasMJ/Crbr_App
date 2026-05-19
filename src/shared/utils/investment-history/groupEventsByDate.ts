import type { InvestmentTimelineEvent } from "@/types/investmentTimeline";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

export type HistoryDateSection = {
  key: string;
  label: string;
  events: InvestmentTimelineEvent[];
};

function parseBrDate(date: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date.trim());
  if (!match) return null;
  const [, day, month, year] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getSectionLabel(event: InvestmentTimelineEvent): string {
  const fromTimestamp =
    event.timestamp > 0 ? new Date(event.timestamp) : null;
  const fromDate =
    !fromTimestamp && event.date && event.date !== "—"
      ? parseBrDate(event.date)
      : null;
  const date = fromTimestamp ?? fromDate;

  if (!date) return "Outras movimentações";

  if (isToday(date)) return "Hoje";
  if (isYesterday(date)) return "Ontem";

  return format(date, "d 'de' MMMM", { locale: ptBR });
}

function getSectionSortKey(event: InvestmentTimelineEvent): number {
  if (event.timestamp > 0) return event.timestamp;
  const parsed = event.date ? parseBrDate(event.date) : null;
  return parsed?.getTime() ?? 0;
}

export function groupEventsByDate(
  events: InvestmentTimelineEvent[],
): HistoryDateSection[] {
  const map = new Map<string, HistoryDateSection>();

  for (const event of events) {
    const label = getSectionLabel(event);
    const key = label.toLowerCase();
    const existing = map.get(key);

    if (existing) {
      existing.events.push(event);
    } else {
      map.set(key, { key, label, events: [event] });
    }
  }

  const sections = Array.from(map.values());

  for (const section of sections) {
    section.events.sort((a, b) => getSectionSortKey(b) - getSectionSortKey(a));
  }

  sections.sort((a, b) => {
    const aMax = Math.max(...a.events.map(getSectionSortKey));
    const bMax = Math.max(...b.events.map(getSectionSortKey));
    return bMax - aMax;
  });

  return sections;
}

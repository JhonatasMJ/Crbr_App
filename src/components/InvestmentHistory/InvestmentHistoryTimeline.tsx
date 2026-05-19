import { Text } from "@/components/ui/text";
import type { InvestmentTimelineEvent } from "@/types/investmentTimeline";
import type { LucideIcon } from "lucide-react-native";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CirclePlus,
  History,
  RefreshCw,
  Trash2,
} from "lucide-react-native";
import { View } from "react-native";
import { groupEventsByDate } from "@/shared/utils/investment-history/groupEventsByDate";

type AmountTone = "credit" | "debit" | "neutral";

function getEventIcon(type: string): LucideIcon {
  const key = type.trim().toLowerCase();
  if (key.includes("saque") || key.includes("withdraw")) return ArrowDownLeft;
  if (key.includes("reinvest")) return RefreshCw;
  if (key.includes("exclus") || key.includes("exclu")) return Trash2;
  if (key.includes("aporte") || key.includes("criac")) return CirclePlus;
  if (key.includes("solicita")) return ArrowUpRight;
  return History;
}

function getAmountTone(type: string): AmountTone {
  const key = type.trim().toLowerCase();
  if (
    key.includes("saque") ||
    key.includes("withdraw") ||
    key.includes("exclus")
  ) {
    return "debit";
  }
  if (
    key.includes("criac") ||
    key.includes("aporte") ||
    key.includes("reinvest")
  ) {
    return "credit";
  }
  return "neutral";
}

function getSubtitle(event: InvestmentTimelineEvent): string {
  const parts: string[] = [];
  const desc = event.description.trim();
  const label = event.label.trim();

  if (desc && desc.toLowerCase() !== label.toLowerCase()) {
    parts.push(desc);
  }

  if (event.time) {
    parts.push(event.time);
  } else if (event.date && event.date !== "—") {
    parts.push(event.date);
  }

  if (event.isArchived) {
    parts.push("Cota encerrada");
  }

  return parts.join(" · ");
}

function amountColorClass(tone: AmountTone): string {
  if (tone === "credit") return "text-primary";
  if (tone === "debit") return "text-zinc-300";
  return "text-white";
}

function ExtractRow({
  event,
  showDivider,
}: {
  event: InvestmentTimelineEvent;
  showDivider: boolean;
}) {
  const Icon = getEventIcon(event.type);
  const tone = getAmountTone(event.type);
  const subtitle = getSubtitle(event);

  return (
    <>
      <View className="flex-row items-center px-4 py-3.5">
        <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-zinc-800/80">
          <Icon size={20} color="#a1a1aa" strokeWidth={1.75} />
        </View>

        <View className="min-h-[44px] min-w-0 flex-1 justify-center pr-3">
          <Text
            className="font-sans-medium text-[15px] leading-5 text-white"
            numberOfLines={2}
          >
            {event.label}
          </Text>
          {subtitle ? (
            <Text
              className="mt-0.5 font-sans text-[13px] leading-[18px] text-zinc-500"
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <Text
          className={`shrink-0 font-sans-semibold text-[15px] ${amountColorClass(tone)}`}
        >
          {event.amount}
        </Text>
      </View>

      {showDivider ? (
        <View className="ml-[68px] h-px bg-zinc-800/90" />
      ) : null}
    </>
  );
}

function EmptyHistory() {
  return (
    <View className="items-center rounded-md bg-zinc-900/40 px-6 py-14">
      <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
        <History size={22} color="#71717a" strokeWidth={1.75} />
      </View>
      <Text className="text-center font-sans-medium text-[15px] text-zinc-300">
        Nenhuma movimentação
      </Text>
      <Text className="mt-1.5 text-center font-sans text-[13px] leading-5 text-zinc-500">
        As transações desta cota aparecerão aqui.
      </Text>
    </View>
  );
}

type InvestmentHistoryTimelineProps = {
  events: InvestmentTimelineEvent[];
};

export function InvestmentHistoryTimeline({
  events,
}: InvestmentHistoryTimelineProps) {
  if (events.length === 0) {
    return <EmptyHistory />;
  }

  const sections = groupEventsByDate(events);

  return (
    <View className="gap-5">
      {sections.map((section) => (
        <View key={section.key}>
          <Text className="mb-2 px-1 font-sans-semibold text-[13px] text-zinc-500">
            {section.label}
          </Text>

          <View className="overflow-hidden rounded-md bg-zinc-900/50">
            {section.events.map((event, index) => (
              <ExtractRow
                key={event.id}
                event={event}
                showDivider={index < section.events.length - 1}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

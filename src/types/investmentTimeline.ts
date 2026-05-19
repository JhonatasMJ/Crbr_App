export type InvestmentTimelineEvent = {
  id: string;
  investmentId?: string;
  investmentName?: string;
  type: string;
  label: string;
  amount: string;
  date: string;
  time?: string;
  description: string;
  timestamp: number;
  isArchived?: boolean;
};

export type LegacyInvestmentHistoryEntry = {
  amount?: string;
  currentAmount?: string;
  date?: string;
  time?: string;
  notes?: string;
  timestamp?: number;
  type?: string;
};

export type DeletedInvestmentArchive = {
  id: string;
  archivedAt?: number;
  history?: Record<string, LegacyInvestmentHistoryEntry>;
  investmentName?: string;
  name?: string;
  investmentAmount?: string;
};

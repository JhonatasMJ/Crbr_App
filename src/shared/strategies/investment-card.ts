type InvestmentCardStyleProps = {
    containerBg: string;
    titleText: string;
    amountText: string;
    helperText: string;
    remainingText: string;
    progressIndicator: string;
    progressTrack: string;
  };
  
export type InvestmentCardVariant = "selected" | "default";

export const INVESTMENT_CARD_STYLE: Record<InvestmentCardVariant, InvestmentCardStyleProps> = {
    selected: {
      containerBg: "bg-primary",
      titleText: "text-secondary",
      amountText: "text-secondary",
      helperText: "text-secondary/80",
      remainingText: "text-secondary",
      progressIndicator: "bg-secondary",
      progressTrack: "bg-secondary/25",
    },
    default: {
      containerBg: "bg-secondary",
      titleText: "text-white",
      amountText: "text-white",
      helperText: "text-white/80",
      remainingText: "text-white",
      progressIndicator: "bg-primary",
      progressTrack: "bg-primary/25",
    },
  };
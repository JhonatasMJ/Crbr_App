import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { auth, database } from "@/shared/services/firebase";
import { calculateInvestmentIncome } from "@/shared/utils/calculateInvestmentIncome";
import { formatInvestmentAmount } from "@/shared/utils/formatInvestmentAmount";
import { InvestmentsParams } from "@/types/investmentsParams";

type InvestmentsContextType = {
  investments: InvestmentsParams[];
  allInvestments: number;
  allInvestmentsFormatted: string;
  balance: number;
  balanceFormatted: string;
  loading: boolean;
};

const InvestmentsContext = createContext<InvestmentsContextType | null>(null);

function parseAmount(value?: string | number): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const parsed = Number(
    String(value ?? "0").replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")
  );

  return Number.isFinite(parsed) ? parsed : 0;
}

export const InvestmentsProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState<InvestmentsParams[]>([]);

  const allInvestments = useMemo(() => {
    return investments.reduce((acc, investment) => {
      const amount = parseAmount(investment.investmentAmount || investment.amount);
      return acc + amount;
    }, 0);
  }, [investments]);

  const currentInvestment = investments[0];

  const balance = useMemo(() => {
    if (!currentInvestment) return 0;

    const amount = parseAmount(
      currentInvestment.investmentAmount || currentInvestment.amount
    );
    const income = calculateInvestmentIncome({
      amount,
      startDate: currentInvestment.startDate,
      endDate: currentInvestment.endDate,
      duration: currentInvestment.duration,
    });

    return amount + income;
  }, [currentInvestment]);

  const allInvestmentsFormatted = useMemo(
    () => formatInvestmentAmount(allInvestments),
    [allInvestments]
  );

  const balanceFormatted = useMemo(
    () => formatInvestmentAmount(balance),
    [balance]
  );

  useEffect(() => {
    let unsubscribeDb: any = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // limpa listener anterior
      if (unsubscribeDb) {
        unsubscribeDb();
        unsubscribeDb = null;
      }

      if (!user) {
        setInvestments([]);
        setLoading(false);
        return;
      }

      const userInvestmentsRef = ref(
        database,
        `users/${user.uid}/investments`
      );

      unsubscribeDb = onValue(userInvestmentsRef, (snapshot) => {
        const rawInvestments = snapshot.val();

        if (!rawInvestments) {
          setInvestments([]);
          setLoading(false);
          return;
        }

        const results = Object.entries(rawInvestments)
          .filter(
            ([, value]) =>
              Boolean(value) && typeof value === "object" && !Array.isArray(value)
          )
          .map(([id, value]) => ({
            id,
            ...(value as Omit<InvestmentsParams, "id">),
          }));

        setInvestments(results);

        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();

      if (unsubscribeDb) {
        unsubscribeDb();
      }
    };
  }, []);

  return (
    <InvestmentsContext.Provider
      value={{
        investments,
        allInvestments,
        allInvestmentsFormatted,
        balance,
        balanceFormatted,
        loading,
      }}
    >
      {children}
    </InvestmentsContext.Provider>
  );
};

export function useInvestments() {
  const context = useContext(InvestmentsContext);

  if (!context) {
    throw new Error("useInvestments deve ser usado dentro do InvestmentsProvider");
  }

  return context;
}
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
import {
  getInvestmentBalance,
  getInvestmentPrincipal,
} from "@/shared/utils/calculateInvestmentIncome";
import { InvestmentsParams } from "@/types/investmentsParams";

type InvestmentsContextType = {
  investments: InvestmentsParams[];
  allInvestments: number;
  TotalBalance: number;
  loading: boolean;
  handleToggleBalance: () => void;
  showData: boolean;
};

const InvestmentsContext = createContext<InvestmentsContextType | null>(null);

export const InvestmentsProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState<InvestmentsParams[]>([]);
  const [showData, setShowData] = useState(true);

  const allInvestments = useMemo(() => {
    return investments.reduce((acc, investment) => acc + getInvestmentPrincipal(investment), 0);
  }, [investments]);

  const currentInvestment = investments[0];

  const TotalBalance = useMemo(() => {
    return currentInvestment ? getInvestmentBalance(currentInvestment) : 0;
  }, [currentInvestment]);

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

  function handleToggleBalance() {
    setShowData(!showData);
  }

  return (
    <InvestmentsContext.Provider
      value={{
        investments,
        allInvestments,
        TotalBalance,
        loading,
        handleToggleBalance,
        showData,
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
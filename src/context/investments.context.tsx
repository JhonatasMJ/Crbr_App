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
  /** Investimento exibido no header (selecionado ou o primeiro). */
  selectedInvestment: InvestmentsParams | undefined;
  selectInvestment: (id: string | undefined) => void;
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
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<
    string | undefined
  >(undefined);
  const [showData, setShowData] = useState(true);

  const selectedInvestment = useMemo(() => {
    if (!investments.length) return undefined;
    if (selectedInvestmentId) {
      const found = investments.find((i) => i.id === selectedInvestmentId);
      if (found) return found;
    }
    return investments[0];
  }, [investments, selectedInvestmentId]);

  useEffect(() => {
    if (!investments.length) {
      setSelectedInvestmentId(undefined);
      return;
    }
    setSelectedInvestmentId((prev) =>
      prev && investments.some((i) => i.id === prev) ? prev : investments[0]?.id
    );
  }, [investments]);

  const allInvestments = useMemo(() => {
    return investments.reduce((acc, investment) => acc + getInvestmentPrincipal(investment), 0);
  }, [investments]);

  const TotalBalance = useMemo(() => {
    return selectedInvestment ? getInvestmentBalance(selectedInvestment) : 0;
  }, [selectedInvestment]);

  function selectInvestment(id: string | undefined) {
    setSelectedInvestmentId(id);
  }

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

      setLoading(true);

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
        selectedInvestment,
        selectInvestment,
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
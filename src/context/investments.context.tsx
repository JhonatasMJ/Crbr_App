import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { onAuthStateChanged } from "firebase/auth";
import { onValue, push, ref, remove, set } from "firebase/database";
import type { InvestmentFormValues } from "@/shared/schemas/investments";
import { auth, database } from "@/shared/services/firebase";
import { formatAmountPlain } from "@/shared/utils/formatInvestmentAmount";
import { INVESTMENT_STATUS } from "@/shared/constants/investmentStatus";
import { formatBrDate, formatBrTime } from "@/shared/utils/investmentDates";
import {
  compareInvestmentsByDaysRemaining,
  getInvestmentBalance,
  getInvestmentPrincipal,
} from "@/shared/utils/calculateInvestmentIncome";
import { InvestmentsParams } from "@/types/investmentsParams";
import { useSnackBarContext } from "./snackbar.context";

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
  deleteInvestment: (id: string) => void;
  createInvestment: (
    data: InvestmentFormValues & {
      investmentAmount: number;
      startDate: string;
      endDate: string;
    },
  ) => Promise<void>;
};

const InvestmentsContext = createContext<InvestmentsContextType | null>(null);

export const InvestmentsProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState<InvestmentsParams[]>([]);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<
    string | undefined
  >(undefined);
  const [showData, setShowData] = useState(true);
  const { notify } = useSnackBarContext();

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
          }))
          .sort(compareInvestmentsByDaysRemaining);

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
  async function deleteInvestment(id: string) {
    try {
      await remove(ref(database, `users/${auth.currentUser?.uid}/investments/${id}`));
    } catch (error) {
      console.error(error);
      notify({
        message: "Erro ao deletar investimento",
        messageType: "ERROR",
      });
      throw error;
    }
  }

  async function createInvestment(
    data: InvestmentFormValues & {
      investmentAmount: number;
      startDate: string;
      endDate: string;
    },
  ) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Usuário não autenticado");

    const now = new Date();
    const amountPlain = formatAmountPlain(data.investmentAmount);

    try {
      const newRef = push(ref(database, `users/${uid}/investments`));
      await set(newRef, {
        amountHistory: [
          {
            amount: amountPlain,
            createdAt: now.getTime(),
            createdDate: formatBrDate(now),
            createdTime: formatBrTime(now),
            description: "Investimento inicial",
            newAmount: amountPlain,
            previousAmount: "0,00",
            type: "Aporte",
          },
        ],
        createdAt: now.getTime(),
        createdDate: formatBrDate(now),
        createdTime: formatBrTime(now),
        duration: data.duration,
        endDate: data.endDate,
        historyEnabled: true,
        investmentAmount: `R$ ${amountPlain}`,
        investmentName: data.investmentName.trim(),
        name: data.investmentName.trim(),
        startDate: data.startDate,
        partialWithdrawalsCount: 0,
        paymentMethod: "Pix",
        pixNumber: data.pixNumber.trim(),
        recused: false,
        reinvestments: [],
        userId: uid,
        status: INVESTMENT_STATUS.PENDING,
      });
    } catch (error) {
      console.error(error);
      notify({
        message: "Erro ao criar investimento",
        messageType: "ERROR",
      });
      throw error;
    }
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
        deleteInvestment,
        createInvestment,
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
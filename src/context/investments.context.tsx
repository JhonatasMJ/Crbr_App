import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { onAuthStateChanged } from "firebase/auth";
import { get, onValue, push, ref, remove, set, update } from "firebase/database";
import type { InvestmentFormValues } from "@/shared/schemas/investments";
import { auth, database } from "@/shared/services/firebase";
import { formatAmountPlain } from "@/shared/utils/formatInvestmentAmount";
import {
  INVESTMENT_STATUS,
  isInvestmentActive,
} from "@/shared/constants/investmentStatus";
import { formatBrDate, formatBrTime } from "@/shared/utils/investmentDates";
import {
  compareInvestmentsByDaysRemaining,
  getInvestmentBalance,
  getInvestmentPrincipal,
} from "@/shared/utils/calculateInvestmentIncome";
import { InvestmentsParams } from "@/types/investmentsParams";
import type { InvestmentAmountHistoryEntry } from "@/types/investmentAmountHistory";
import type { InvestmentReinvestmentEntry } from "@/types/investmentAmountHistory";
import type { InvestmentReceiptData } from "@/types/investmentReceipt";
import {
  canWithdrawInvestment,
  getWithdrawBlockedMessage,
} from "@/shared/utils/investmentOperations";
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
      durationLabel: string;
      investorName?: string;
      investorEmail?: string;
    },
  ) => Promise<InvestmentReceiptData>;
  withdrawInvestmentFull: (investmentId: string) => Promise<void>;
  withdrawInvestmentPartial: (
    investmentId: string,
    amount: number,
  ) => Promise<void>;
  reinvestInInvestment: (investmentId: string, amount: number) => Promise<void>;
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
  function getUserInvestmentRef(investmentId: string) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Usuário não autenticado");
    return ref(database, `users/${uid}/investments/${investmentId}`);
  }

  async function fetchUserInvestment(
    investmentId: string,
  ): Promise<InvestmentsParams> {
    const snapshot = await get(getUserInvestmentRef(investmentId));
    if (!snapshot.exists()) {
      throw new Error("Investimento não encontrado");
    }
    return { id: investmentId, ...(snapshot.val() as Omit<InvestmentsParams, "id">) };
  }

  function buildAmountHistoryEntry(
    type: string,
    amount: number,
    previousPlain: string,
    newPlain: string,
    description: string,
  ): InvestmentAmountHistoryEntry {
    const now = new Date();
    const amountPlain = formatAmountPlain(amount);
    return {
      amount: amountPlain,
      createdAt: now.getTime(),
      createdDate: formatBrDate(now),
      createdTime: formatBrTime(now),
      description,
      newAmount: newPlain,
      previousAmount: previousPlain,
      type,
    };
  }

  function assertCanWithdraw(investment: InvestmentsParams) {
    if (!canWithdrawInvestment(investment)) {
      throw new Error(getWithdrawBlockedMessage(investment));
    }
  }

  async function withdrawInvestmentFull(investmentId: string) {
    try {
      const investment = await fetchUserInvestment(investmentId);
      assertCanWithdraw(investment);

      const balance = getInvestmentBalance(investment);
      const previousPlain = formatAmountPlain(getInvestmentPrincipal(investment));
      const history = investment.amountHistory ?? [];

      await update(getUserInvestmentRef(investmentId), {
        investmentAmount: "R$ 0,00",
        status: INVESTMENT_STATUS.INACTIVE,
        amountHistory: [
          ...history,
          buildAmountHistoryEntry(
            "Saque total",
            balance,
            previousPlain,
            "0,00",
            "Saque total do investimento",
          ),
        ],
      });

      notify({
        message: "Saque total solicitado com sucesso",
        messageType: "SUCCESS",
      });
    } catch (error) {
      console.error(error);
      notify({
        message:
          error instanceof Error ? error.message : "Erro ao sacar investimento",
        messageType: "ERROR",
      });
      throw error;
    }
  }

  async function withdrawInvestmentPartial(
    investmentId: string,
    amount: number,
  ) {
    try {
      const investment = await fetchUserInvestment(investmentId);
      assertCanWithdraw(investment);

      const balance = getInvestmentBalance(investment);
      if (amount > balance) {
        throw new Error(
          `Valor máximo para saque parcial é ${formatAmountPlain(balance)}`,
        );
      }

      const previousPrincipal = getInvestmentPrincipal(investment);
      const newPrincipal = Math.max(0, previousPrincipal - amount);
      const previousPlain = formatAmountPlain(previousPrincipal);
      const newPlain = formatAmountPlain(newPrincipal);
      const history = investment.amountHistory ?? [];

      await update(getUserInvestmentRef(investmentId), {
        investmentAmount: `R$ ${newPlain}`,
        partialWithdrawalsCount: (investment.partialWithdrawalsCount ?? 0) + 1,
        amountHistory: [
          ...history,
          buildAmountHistoryEntry(
            "Saque parcial",
            amount,
            previousPlain,
            newPlain,
            "Saque parcial do investimento",
          ),
        ],
      });

      notify({
        message: "Saque parcial solicitado com sucesso",
        messageType: "SUCCESS",
      });
    } catch (error) {
      console.error(error);
      notify({
        message:
          error instanceof Error ? error.message : "Erro ao sacar parcialmente",
        messageType: "ERROR",
      });
      throw error;
    }
  }

  async function reinvestInInvestment(investmentId: string, amount: number) {
    try {
      const investment = await fetchUserInvestment(investmentId);
      if (!isInvestmentActive(investment.status)) {
        throw new Error("O investimento precisa estar ativo para reinvestir.");
      }
      if (amount <= 0) {
        throw new Error("Informe um valor válido para reinvestir.");
      }

      const previousPrincipal = getInvestmentPrincipal(investment);
      const newPrincipal = previousPrincipal + amount;
      const previousPlain = formatAmountPlain(previousPrincipal);
      const newPlain = formatAmountPlain(newPrincipal);
      const history = investment.amountHistory ?? [];
      const now = new Date();
      const reinvestment: InvestmentReinvestmentEntry = {
        amount: formatAmountPlain(amount),
        createdAt: now.getTime(),
        createdDate: formatBrDate(now),
        createdTime: formatBrTime(now),
      };

      await update(getUserInvestmentRef(investmentId), {
        investmentAmount: `R$ ${newPlain}`,
        reinvestments: [...(investment.reinvestments ?? []), reinvestment],
        amountHistory: [
          ...history,
          buildAmountHistoryEntry(
            "Reinvestimento",
            amount,
            previousPlain,
            newPlain,
            "Reinvestimento no investimento",
          ),
        ],
      });

      notify({
        message: "Reinvestimento registrado com sucesso",
        messageType: "SUCCESS",
      });
    } catch (error) {
      console.error(error);
      notify({
        message:
          error instanceof Error ? error.message : "Erro ao reinvestir",
        messageType: "ERROR",
      });
      throw error;
    }
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
      durationLabel: string;
      investorName?: string;
      investorEmail?: string;
    },
  ): Promise<InvestmentReceiptData> {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Usuário não autenticado");

    const now = new Date();
    const amountPlain = formatAmountPlain(data.investmentAmount);
    const createdDate = formatBrDate(now);
    const createdTime = formatBrTime(now);

    try {
      const newRef = push(ref(database, `users/${uid}/investments`));
      await set(newRef, {
        amountHistory: [
          {
            amount: amountPlain,
            createdAt: now.getTime(),
            createdDate,
            createdTime,
            description: "Investimento inicial",
            newAmount: amountPlain,
            previousAmount: "0,00",
            type: "Aporte",
          },
        ],
        createdAt: now.getTime(),
        createdDate,
        createdTime,
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

      return {
        investmentId: newRef.key!,
        investmentName: data.investmentName.trim(),
        investmentAmount: data.investmentAmount,
        durationLabel: data.durationLabel,
        startDate: data.startDate,
        endDate: data.endDate,
        pixNumber: data.pixNumber.trim(),
        status: INVESTMENT_STATUS.PENDING,
        paymentMethod: "Pix",
        createdDate,
        createdTime,
        investorName: data.investorName,
        investorEmail: data.investorEmail,
      };
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
        withdrawInvestmentFull,
        withdrawInvestmentPartial,
        reinvestInInvestment,
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
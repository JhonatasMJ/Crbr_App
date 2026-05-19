import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import type { InvestmentReceiptData } from "@/types/investmentReceipt";
import type { InvestmentPendingActionType } from "@/types/investmentPendingAction";
import { applyPendingInvestmentActionIfNeeded } from "@/shared/utils/applyPendingInvestmentAction";
import { buildInvestmentRequestReceipt } from "@/shared/utils/buildInvestmentRequestReceipt";
import {
  canPerformFullWithdraw,
  canPerformPartialWithdraw,
  canReinvestInvestment,
  getFullWithdrawMaxAmount,
  getInvestmentEarnings,
  getPartialWithdrawBlockedMessage,
  getReinvestBlockedMessage,
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
  withdrawInvestmentFull: (investmentId: string) => Promise<InvestmentReceiptData>;
  withdrawInvestmentPartial: (investmentId: string) => Promise<InvestmentReceiptData>;
  reinvestInInvestment: (investmentId: string) => Promise<InvestmentReceiptData>;
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
  const applyingPendingRef = useRef<Set<string>>(new Set());

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

        for (const inv of results) {
          if (!inv.id || !inv.pendingAction) continue;
          if (applyingPendingRef.current.has(inv.id)) continue;

          applyingPendingRef.current.add(inv.id);
          void applyPendingInvestmentActionIfNeeded(inv).finally(() => {
            applyingPendingRef.current.delete(inv.id!);
          });
        }

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

  const REQUEST_STATUS: Record<InvestmentPendingActionType, string> = {
    "withdraw-full": INVESTMENT_STATUS.WAITING_WITHDRAW,
    "withdraw-partial": INVESTMENT_STATUS.WAITING_EARNINGS,
    reinvest: INVESTMENT_STATUS.WAITING_REINVEST,
  };

  const REQUEST_HISTORY: Record<InvestmentPendingActionType, string> = {
    "withdraw-full": "Solicitação de saque total",
    "withdraw-partial": "Solicitação de saque de rendimento",
    reinvest: "Solicitação de reinvestimento",
  };

  const REQUEST_SUCCESS: Record<InvestmentPendingActionType, string> = {
    "withdraw-full": "Saque total solicitado com sucesso",
    "withdraw-partial": "Saque de rendimento solicitado com sucesso",
    reinvest: "Reinvestimento solicitado com sucesso",
  };

  async function submitInvestmentRequest(
    investmentId: string,
    actionType: InvestmentPendingActionType,
  ): Promise<InvestmentReceiptData> {
    const investment = await fetchUserInvestment(investmentId);
    const validators = {
      "withdraw-full": {
        can: canPerformFullWithdraw,
        message: getWithdrawBlockedMessage,
        amount: () => getFullWithdrawMaxAmount(investment),
      },
      "withdraw-partial": {
        can: canPerformPartialWithdraw,
        message: getPartialWithdrawBlockedMessage,
        amount: () => getInvestmentEarnings(investment),
      },
      reinvest: {
        can: canReinvestInvestment,
        message: getReinvestBlockedMessage,
        amount: () => getInvestmentBalance(investment),
      },
    } as const;

    const { can, message, amount } = validators[actionType];
    if (!can(investment)) {
      throw new Error(message(investment));
    }

    const requestAmount = amount();
    const now = new Date();
    const previousPrincipal = getInvestmentPrincipal(investment);
    const previousPlain = formatAmountPlain(previousPrincipal);
    const newPlain =
      actionType === "reinvest"
        ? formatAmountPlain(requestAmount)
        : previousPlain;
    const historyEntryAmount =
      actionType === "reinvest"
        ? requestAmount - previousPrincipal
        : requestAmount;
    const history = investment.amountHistory ?? [];

    await update(getUserInvestmentRef(investmentId), {
      status: REQUEST_STATUS[actionType],
      pendingAction: {
        type: actionType,
        amount: requestAmount,
        requestedAt: now.getTime(),
        createdDate: formatBrDate(now),
        createdTime: formatBrTime(now),
      },
      amountHistory: [
        ...history,
        buildAmountHistoryEntry(
          REQUEST_HISTORY[actionType],
          historyEntryAmount,
          previousPlain,
          newPlain,
          REQUEST_HISTORY[actionType],
        ),
      ],
    });

    notify({
      message: REQUEST_SUCCESS[actionType],
      messageType: "SUCCESS",
    });

    return buildInvestmentRequestReceipt(
      investment,
      actionType,
      requestAmount,
      auth.currentUser,
    );
  }

  async function withdrawInvestmentFull(investmentId: string) {
    try {
      return await submitInvestmentRequest(investmentId, "withdraw-full");
    } catch (error) {
      console.error(error);
      notify({
        message:
          error instanceof Error ? error.message : "Erro ao solicitar saque",
        messageType: "ERROR",
      });
      throw error;
    }
  }

  async function withdrawInvestmentPartial(investmentId: string) {
    try {
      return await submitInvestmentRequest(investmentId, "withdraw-partial");
    } catch (error) {
      console.error(error);
      notify({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao solicitar saque de rendimento",
        messageType: "ERROR",
      });
      throw error;
    }
  }

  async function reinvestInInvestment(investmentId: string) {
    try {
      return await submitInvestmentRequest(investmentId, "reinvest");
    } catch (error) {
      console.error(error);
      notify({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao solicitar reinvestimento",
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
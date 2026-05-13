import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, push, ref, remove, set } from "firebase/database";
import { auth, database } from "@/shared/services/firebase";
import type { Beneficiary, BeneficiaryPayload } from "@/types/beneficiary";
import { useSnackBarContext } from "./snackbar.context";

type BeneficiaryContextType = {
  beneficiary: Beneficiary[];
  loading: boolean;
  addBeneficiary: (data: BeneficiaryPayload) => Promise<void>;
  updateBeneficiary: (
    id: string,
    data: BeneficiaryPayload,
  ) => Promise<void>;
  deleteBeneficiary: (id: string) => Promise<void>;
};

const BeneficiaryContext =
  createContext<BeneficiaryContextType | null>(null);

export const BeneficiaryProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [loading, setLoading] = useState(true);
  const [beneficiary, setBeneficiary] = useState<Beneficiary[]>([]);
  const { notify } = useSnackBarContext();

  useEffect(() => {
    let unsubscribeDb: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeDb) {
        unsubscribeDb();
        unsubscribeDb = null;
      }

      if (!user) {
        setBeneficiary([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const beneficiaryRef = ref(
        database,
        `users/${user.uid}/beneficiary`,
      );

      unsubscribeDb = onValue(beneficiaryRef, (snapshot) => {
        const raw = snapshot.val();

        if (!raw) {
          setBeneficiary([]);
          setLoading(false);
          return;
        }

        const list = Object.entries(raw)
          .filter(
            ([, value]) =>
              Boolean(value) &&
              typeof value === "object" &&
              !Array.isArray(value),
          )
          .map(([id, value]) => {
            const v = value as Record<string, unknown>;
            return {
              id,
              cpf: String(v.cpf ?? ""),
              name: String(v.name ?? ""),
              percentage: Number(v.percentage ?? 0),
            } satisfies Beneficiary;
          });

        setBeneficiary(list);
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDb) unsubscribeDb();
    };
  }, []);

  async function addBeneficiary(data: BeneficiaryPayload) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Usuário não autenticado");
    try {
      const newRef = push(ref(database, `users/${uid}/beneficiary`));
      await set(newRef, {
        cpf: data.cpf,
        name: data.name,
        percentage: data.percentage,
      });
    } catch (error) {
      console.error(error);
      notify({
        message: "Erro ao adicionar beneficiário",
        messageType: "ERROR",
      });
      throw error;
    }
  }

  async function updateBeneficiary(id: string, data: BeneficiaryPayload) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Usuário não autenticado");
    try {
      await set(ref(database, `users/${uid}/beneficiary/${id}`), {
        cpf: data.cpf,
        name: data.name,
        percentage: data.percentage,
      });
    } catch (error) {
      console.error(error);
      notify({
        message: "Erro ao atualizar beneficiário",
        messageType: "ERROR",
      });
      throw error;
    }
  }

  async function deleteBeneficiary(id: string) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Usuário não autenticado");
    try {
      await remove(ref(database, `users/${uid}/beneficiary/${id}`));
    } catch (error) {
      console.error(error);
      notify({
        message: "Erro ao excluir beneficiário",
        messageType: "ERROR",
      });
      throw error;
    }
  }

  return (
    <BeneficiaryContext.Provider
      value={{
        beneficiary,
        loading,
        addBeneficiary,
        updateBeneficiary,
        deleteBeneficiary,
      }}
    >
      {children}
    </BeneficiaryContext.Provider>
  );
};

export function useBeneficiary() {
  const context = useContext(BeneficiaryContext);
  if (!context) {
    throw new Error(
      "useBeneficiary deve ser usado dentro do BeneficiaryProvider",
    );
  }
  return context;
}

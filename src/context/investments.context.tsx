import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, get } from "firebase/database";
import { auth, database } from "@/shared/services/firebase";
import { InvestmentsParams } from "@/types/investmentsParams";

type InvestmentsContextType = {
  investments: InvestmentsParams[];
  loading: boolean;
};

const InvestmentsContext = createContext<InvestmentsContextType | null>(null);

export const InvestmentsProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState<InvestmentsParams[]>([]);

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

      unsubscribeDb = onValue(userInvestmentsRef, async (snapshot) => {
        const ids = snapshot.val();

        if (!ids) {
          setInvestments([]);
          setLoading(false);
          return;
        }

        const keys = Object.keys(ids);

        try {
          const promises = keys.map(async (id) => {
            const snap = await get(ref(database, `investments/${id}`));

            return {
              id,
              ...snap.val(),
            };
          });

          const results: any = await Promise.all(promises);

          setInvestments(results);
        } catch (error) {
          console.log("Erro ao buscar investimentos:", error);
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

  return (
    <InvestmentsContext.Provider value={{ investments, loading }}>
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
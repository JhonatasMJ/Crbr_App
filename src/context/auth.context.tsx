import { RegisterParams } from "@/types/registerParams";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, database } from "@/shared/services/firebase";
import { ref, set } from "firebase/database";
import { LoginParams } from "@/types/loginParams";

type AuthContextType = {
  register: (data: RegisterParams) => Promise<void>;
  loading: boolean;
  user: FirebaseUser | null;
  login: (data: LoginParams) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  /* Faz Login automatico */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser);
    });

    return unsubscribe;
  }, []);

  async function register(data: RegisterParams) {
    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );

      const uid = userCredential.user.uid;

      await set(ref(database, `users/${uid}`), {
        name: data.name,
        email: data.email,
        cpf: data.cpf,
        phone: data.phone,
        birthDate: data.birthDate,
        city: data.city,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function login({ email, password }: LoginParams) {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  /* Faz Logout */
  async function logout() {
    try {
      setLoading(true);
      await signOut(auth);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ register, loading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/* Hook para usar o AuthContext */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro do AuthProvider");
  }

  return context;
}

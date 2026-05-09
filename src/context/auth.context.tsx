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
  updateProfile,
} from "firebase/auth";
import { auth, database } from "@/shared/services/firebase";
import { ref, set } from "firebase/database";
import { LoginParams } from "@/types/loginParams";
import { useSnackBarContext } from "./snackbar.context";
import { UpdateUserParams } from "@/types/updateUserParams";

type AuthContextType = {
  register: (data: RegisterParams) => Promise<void>;
  loading: boolean;
  initializing: boolean;
  user: FirebaseUser | null;
  login: (data: LoginParams) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: UpdateUserParams) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const { notify } = useSnackBarContext();

  /* Faz Login automatico */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser);
      setInitializing(false);
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
  
    } catch (error: any) {
     /* Tratamento de erros do Firebase, NOTIFY É DA SNACKBAR */
      if (error.code === "auth/invalid-credential") {
        notify({
          message: "Email ou senha inválidos",
          messageType: "ERROR",
        });
      } else {
        notify({
          message: "Erro ao fazer login",
          messageType: "ERROR",
          });
      }
  
      throw error; // mantém comportamento atual se precisar
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(data: UpdateUserParams) {
    try {
      setLoading(true);
      if (!user) throw new Error("Usuário não encontrado");
      await updateProfile(user, {
        displayName: data.name,
      });
      await set(ref(database, `users/${user.uid}`), {
        ...user,
        ...data,
      });
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
    <AuthContext.Provider
      value={{ register, loading, initializing, user, login, logout, updateUser }}
    >
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

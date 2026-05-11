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
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, database } from "@/shared/services/firebase";
import { get, ref, set } from "firebase/database";
import * as SecureStore from "expo-secure-store";
import { LoginParams } from "@/types/loginParams";
import { useSnackBarContext } from "./snackbar.context";
import type { UserProfile, UserUpdatePayload } from "@/types/user";

const REMEMBERED_LOGIN_SECURE_KEY = "crbr_remembered_login";

export type RememberedLogin = {
  email: string;
  password: string;
};

async function clearRememberedLogin(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(REMEMBERED_LOGIN_SECURE_KEY);
  } catch {
    /* item pode não existir */
  }
}

async function getRememberedLogin(): Promise<RememberedLogin | null> {
  try {
    const raw = await SecureStore.getItemAsync(REMEMBERED_LOGIN_SECURE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<RememberedLogin>;
      if (
        typeof parsed.email === "string" &&
        typeof parsed.password === "string"
      ) {
        return { email: parsed.email, password: parsed.password };
      }
    }
  } catch {
    /* JSON inválido ou SecureStore indisponível */
  }
  return null;
}

async function persistRememberedLogin(data: LoginParams): Promise<void> {
  const payload: RememberedLogin = {
    email: data.email.trim(),
    password: data.password,
  };
  await SecureStore.setItemAsync(
    REMEMBERED_LOGIN_SECURE_KEY,
    JSON.stringify(payload),
  );
}

type AuthContextType = {
  register: (data: RegisterParams) => Promise<void>;
  loading: boolean;
  initializing: boolean;
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  login: (data: LoginParams) => Promise<void>;
  loginWithRemember: (data: LoginParams, remember: boolean) => Promise<void>;
  getRememberedLogin: () => Promise<RememberedLogin | null>;
  clearRememberedLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: UserUpdatePayload) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { notify } = useSnackBarContext();

  /* Faz Login automatico */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (!fbUser) {
        setUserProfile(null);
        setInitializing(false);
        return;
      }
      try {
        const snap = await get(ref(database, `users/${fbUser.uid}`));
        setUserProfile(
          snap.exists() ? (snap.val() as UserProfile) : null,
        );
      } catch (e) {
        console.error(e);
        setUserProfile(null);
      } finally {
        setInitializing(false);
      }
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
        phoneNumber: data.phoneNumber,
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
  
      throw error; 
    } finally {
      setLoading(false);
    }
  }

  async function loginWithRemember(data: LoginParams, remember: boolean) {
    await login(data);
    if (remember) {
      await persistRememberedLogin(data);
    } else {
      await clearRememberedLogin();
    }
  }

  async function updateUser(data: UserUpdatePayload) {
    try {
      setLoading(true);
      if (!user) throw new Error("Usuário não encontrado");
      await updateProfile(user, {
        displayName: data.name,
      });
      await set(ref(database, `users/${user.uid}`), {
        ...userProfile,
        ...data,
        email: user.email ?? userProfile?.email,
      });
      setUserProfile((prev) => ({
        ...prev,
        ...data,
        email: user.email ?? prev?.email,
      }));
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

  async function resetPassword(email: string) {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      notify({
        message: `Link enviado com sucesso`,
        messageType: "SUCCESS",
      });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }


  return (
    <AuthContext.Provider
      value={{
        register,
        loading,
        initializing,
        user,
        userProfile,
        login,
        loginWithRemember,
        getRememberedLogin,
        clearRememberedLogin,
        logout,
        updateUser,
        resetPassword,
      }}
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

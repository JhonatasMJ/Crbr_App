import { RegisterParams } from "@/types/registerParams";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { router } from "expo-router";
import { resolveIsAdmin } from "@/shared/constants/admin";

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
import { isCpfAlreadyRegistered } from "@/shared/services/checkCpfAvailability";
import { isEmailAlreadyRegistered } from "@/shared/services/checkEmailAvailability";
import { normalizeCpf } from "@/shared/utils/cpf";
import { encodeEmailKey, normalizeEmail } from "@/shared/utils/email";
import * as SecureStore from "expo-secure-store";
import { LoginParams } from "@/types/loginParams";
import { useSnackBarContext } from "./snackbar.context";
import type { UserProfile, UserUpdatePayload } from "@/types/user";
import { authenticateWithBiometric } from "@/shared/utils/biometricAuth";

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
  isAdmin: boolean;
  login: (data: LoginParams) => Promise<void>;
  loginWithRemember: (data: LoginParams, remember: boolean) => Promise<void>;
  tryBiometricRememberedLogin: () => Promise<boolean>;
  getRememberedLogin: () => Promise<RememberedLogin | null>;
  clearRememberedLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: UserUpdatePayload) => Promise<void>;
  resetPassword: (email: string) => Promise<string>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { notify } = useSnackBarContext();

  const isAdmin = useMemo(
    () => resolveIsAdmin(user?.email, userProfile?.email),
    [user?.email, userProfile?.email],
  );

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
        if (snap.exists()) {
          const profile = snap.val() as UserProfile;
          const cpf = normalizeCpf(profile.cpf ?? "");
          if (cpf) {
            await set(ref(database, `cpfIndex/${cpf}`), fbUser.uid);
          }
          const email = normalizeEmail(profile.email ?? fbUser.email ?? "");
          if (email) {
            await set(ref(database, `emailIndex/${encodeEmailKey(email)}`), fbUser.uid);
          }
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
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

      const cpf = normalizeCpf(data.cpf);
      const email = normalizeEmail(data.email);

      if (await isCpfAlreadyRegistered(cpf)) {
        notify({
          message: "Já existe uma conta cadastrada com este CPF",
          messageType: "ERROR",
        });
        throw new Error("CPF_ALREADY_REGISTERED");
      }

      if (await isEmailAlreadyRegistered(email)) {
        notify({
          message: "Já existe uma conta cadastrada com este e-mail",
          messageType: "ERROR",
        });
        throw new Error("EMAIL_ALREADY_REGISTERED");
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        data.password,
      );

      const uid = userCredential.user.uid;

      await set(ref(database, `users/${uid}`), {
        username: data.name,
        email,
        cpf,
        phoneNumber: data.phoneNumber,
        birthDate: data.birthDate,
        city: data.city,
        createdAt: new Date().toISOString(),
      });

      await set(ref(database, `cpfIndex/${cpf}`), uid);
      await set(ref(database, `emailIndex/${encodeEmailKey(email)}`), uid);
    } catch (error: unknown) {
      console.error(error);

      const code =
        error && typeof error === "object" && "code" in error
          ? String((error as { code: string }).code)
          : "";

      if (code === "auth/email-already-in-use") {
        notify({
          message: "Já existe uma conta cadastrada com este e-mail",
          messageType: "ERROR",
        });
      } else if (code === "auth/weak-password") {
        notify({
          message: "Senha muito fraca. Use pelo menos 6 caracteres.",
          messageType: "ERROR",
        });
      } else if (code === "auth/invalid-email") {
        notify({
          message: "E-mail inválido.",
          messageType: "ERROR",
        });
      } else if (
        error instanceof Error &&
        (error.message === "CPF_ALREADY_REGISTERED" ||
          error.message === "EMAIL_ALREADY_REGISTERED")
      ) {
        /* já notificado acima */
      } else {
        notify({
          message: "Não foi possível criar a conta. Tente novamente.",
          messageType: "ERROR",
        });
      }

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

  async function tryBiometricRememberedLogin(): Promise<boolean> {
    const remembered = await getRememberedLogin();
    if (!remembered) return false;

    const authenticated = await authenticateWithBiometric();
    if (!authenticated) return false;

    try {
      await login(remembered);
      return true;
    } catch {
      return false;
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
        username: data.name,
        phoneNumber: data.phoneNumber,
        city: data.city,
        email: user.email ?? userProfile?.email,
      });
      setUserProfile((prev) => ({
        ...prev,
        username: data.name,
        phoneNumber: data.phoneNumber,
        city: data.city,
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
      await clearRememberedLogin();
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(email: string): Promise<string> {
    const normalizedEmail = email.trim();

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, normalizedEmail);
      return normalizedEmail;
    } catch (error: unknown) {
      console.error(error);
      const code =
        error && typeof error === "object" && "code" in error
          ? String((error as { code: string }).code)
          : "";

      if (code === "auth/invalid-email") {
        notify({ message: "E-mail inválido.", messageType: "ERROR" });
      } else if (code === "auth/too-many-requests") {
        notify({
          message: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
          messageType: "ERROR",
        });
      } else {
        notify({
          message: "Não foi possível enviar o e-mail. Tente novamente.",
          messageType: "ERROR",
        });
      }

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
        isAdmin,
        login,
        loginWithRemember,
        tryBiometricRememberedLogin,
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

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
  sendEmailVerification,
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
import {
  registerForPushNotificationsAsync,
  unregisterPushNotificationsAsync,
} from "@/shared/services/notifications";
import {
  clearPendingRegistration,
  getPendingRegistration,
  persistPendingRegistration,
  toPendingRegistration,
  type PendingRegistration,
} from "@/shared/utils/pendingRegistration";
import { VERIFY_EMAIL_HREF } from "@/shared/utils/authRouting";

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

async function writeAppProfile(
  uid: string,
  pending: PendingRegistration,
): Promise<UserProfile> {
  const profile: UserProfile = {
    username: pending.name,
    email: pending.email,
    cpf: pending.cpf,
    phoneNumber: pending.phoneNumber,
    birthDate: pending.birthDate,
    city: pending.city,
    createdAt: new Date().toISOString(),
  };

  await set(ref(database, `users/${uid}`), profile);
  await set(ref(database, `cpfIndex/${pending.cpf}`), uid);
  await set(
    ref(database, `emailIndex/${encodeEmailKey(pending.email)}`),
    uid,
  );

  return profile;
}

function getFirebaseErrorCode(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code: string }).code);
  }
  return "";
}

type AuthContextType = {
  register: (data: RegisterParams) => Promise<string>;
  loading: boolean;
  initializing: boolean;
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isEmailVerified: boolean;
  login: (data: LoginParams) => Promise<void>;
  loginWithRemember: (data: LoginParams, remember: boolean) => Promise<void>;
  tryBiometricRememberedLogin: () => Promise<boolean>;
  getRememberedLogin: () => Promise<RememberedLogin | null>;
  clearRememberedLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: UserUpdatePayload) => Promise<void>;
  resetPassword: (email: string) => Promise<string>;
  resendEmailVerification: () => Promise<void>;
  completeRegistrationAfterEmailVerification: () => Promise<boolean>;
  getPendingRegistrationEmail: () => Promise<string | null>;
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

  const isEmailVerified = Boolean(user?.emailVerified);

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
            await set(
              ref(database, `emailIndex/${encodeEmailKey(email)}`),
              fbUser.uid,
            );
          }
          setUserProfile(profile);
          void registerForPushNotificationsAsync(fbUser.uid);
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

  /**
   * Inicia o cadastro: cria o usuário Auth (necessário para o e-mail do Firebase),
   * envia a confirmação e encerra a sessão. O perfil no app só é gravado após confirmar.
   */
  async function register(data: RegisterParams): Promise<string> {
    try {
      setLoading(true);

      const pending = toPendingRegistration(data);

      if (await isCpfAlreadyRegistered(pending.cpf)) {
        notify({
          message: "Já existe uma conta cadastrada com este CPF",
          messageType: "ERROR",
        });
        throw new Error("CPF_ALREADY_REGISTERED");
      }

      if (await isEmailAlreadyRegistered(pending.email)) {
        notify({
          message: "Já existe uma conta cadastrada com este e-mail",
          messageType: "ERROR",
        });
        throw new Error("EMAIL_ALREADY_REGISTERED");
      }

      try {
        const credential = await createUserWithEmailAndPassword(
          auth,
          pending.email,
          pending.password,
        );
        await sendEmailVerification(credential.user);
      } catch (error: unknown) {
        const code = getFirebaseErrorCode(error);

        if (code === "auth/email-already-in-use") {
          try {
            const existing = await signInWithEmailAndPassword(
              auth,
              pending.email,
              pending.password,
            );
            await existing.user.reload();

            if (existing.user.emailVerified) {
              const snap = await get(ref(database, `users/${existing.user.uid}`));
              if (snap.exists()) {
                await signOut(auth);
                notify({
                  message: "Já existe uma conta cadastrada com este e-mail",
                  messageType: "ERROR",
                });
                throw new Error("EMAIL_ALREADY_REGISTERED");
              }
              await writeAppProfile(existing.user.uid, pending);
              await clearPendingRegistration();
              await signOut(auth);
              notify({
                message: "E-mail já confirmado. Faça login para continuar.",
                messageType: "SUCCESS",
              });
              throw new Error("ALREADY_VERIFIED_NEEDS_LOGIN");
            }

            await sendEmailVerification(existing.user);
          } catch (inner: unknown) {
            if (
              inner instanceof Error &&
              (inner.message === "EMAIL_ALREADY_REGISTERED" ||
                inner.message === "ALREADY_VERIFIED_NEEDS_LOGIN")
            ) {
              throw inner;
            }

            const innerCode = getFirebaseErrorCode(inner);
            if (
              innerCode === "auth/invalid-credential" ||
              innerCode === "auth/wrong-password" ||
              innerCode === "auth/user-not-found"
            ) {
              notify({
                message: "Já existe uma conta cadastrada com este e-mail",
                messageType: "ERROR",
              });
              throw new Error("EMAIL_ALREADY_REGISTERED");
            }
            throw inner;
          }
        } else {
          throw error;
        }
      }

      await persistPendingRegistration(pending);
      await signOut(auth);
      setUser(null);
      setUserProfile(null);

      notify({
        message: "E-mail de confirmação enviado.",
        messageType: "SUCCESS",
      });

      return pending.email;
    } catch (error: unknown) {
      console.error(error);

      if (auth.currentUser) {
        try {
          await signOut(auth);
        } catch {
          /* ignore */
        }
        setUser(null);
        setUserProfile(null);
      }

      const code = getFirebaseErrorCode(error);

      if (
        error instanceof Error &&
        (error.message === "CPF_ALREADY_REGISTERED" ||
          error.message === "EMAIL_ALREADY_REGISTERED" ||
          error.message === "ALREADY_VERIFIED_NEEDS_LOGIN")
      ) {
        throw error;
      }

      if (code === "auth/weak-password") {
        notify({
          message: "Senha muito fraca. Use pelo menos 6 caracteres.",
          messageType: "ERROR",
        });
      } else if (code === "auth/invalid-email") {
        notify({
          message: "E-mail inválido.",
          messageType: "ERROR",
        });
      } else if (code === "auth/too-many-requests") {
        notify({
          message:
            "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
          messageType: "ERROR",
        });
      } else if (code === "auth/email-already-in-use") {
        notify({
          message: "Já existe uma conta cadastrada com este e-mail",
          messageType: "ERROR",
        });
      } else {
        notify({
          message: "Não foi possível iniciar o cadastro. Tente novamente.",
          messageType: "ERROR",
        });
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function getPendingRegistrationEmail(): Promise<string | null> {
    const pending = await getPendingRegistration();
    return pending?.email ?? null;
  }

  async function resendEmailVerification() {
    const pending = await getPendingRegistration();
    if (!pending) {
      notify({
        message: "Sessão de cadastro expirada. Cadastre-se novamente.",
        messageType: "ERROR",
      });
      throw new Error("NO_PENDING_REGISTRATION");
    }

    try {
      setLoading(true);
      const credential = await signInWithEmailAndPassword(
        auth,
        pending.email,
        pending.password,
      );
      await sendEmailVerification(credential.user);
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      notify({
        message: "E-mail de confirmação reenviado.",
        messageType: "SUCCESS",
      });
    } catch (error: unknown) {
      console.error(error);
      if (auth.currentUser) {
        try {
          await signOut(auth);
        } catch {
          /* ignore */
        }
      }
      setUser(null);
      setUserProfile(null);

      const code = getFirebaseErrorCode(error);
      if (code === "auth/too-many-requests") {
        notify({
          message:
            "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
          messageType: "ERROR",
        });
      } else {
        notify({
          message: "Não foi possível reenviar o e-mail. Tente novamente.",
          messageType: "ERROR",
        });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }

  /** Confirma o e-mail, cria o perfil no app e mantém o usuário logado. */
  async function completeRegistrationAfterEmailVerification(): Promise<boolean> {
    const pending = await getPendingRegistration();
    if (!pending || !pending.cpf || !pending.name) {
      notify({
        message: "Sessão de cadastro expirada. Cadastre-se novamente.",
        messageType: "ERROR",
      });
      throw new Error("NO_PENDING_REGISTRATION");
    }

    try {
      setLoading(true);

      const credential = await signInWithEmailAndPassword(
        auth,
        pending.email,
        pending.password,
      );
      await credential.user.reload();

      if (!credential.user.emailVerified) {
        await signOut(auth);
        setUser(null);
        setUserProfile(null);
        notify({
          message:
            "E-mail ainda não confirmado.",
          messageType: "ERROR",
        });
        return false;
      }

      const uid = credential.user.uid;
      const snap = await get(ref(database, `users/${uid}`));
      let profile: UserProfile;

      if (snap.exists()) {
        profile = snap.val() as UserProfile;
      } else {
        if (await isCpfAlreadyRegistered(pending.cpf)) {
          await signOut(auth);
          setUser(null);
          setUserProfile(null);
          notify({
            message: "Já existe uma conta cadastrada com este CPF",
            messageType: "ERROR",
          });
          throw new Error("CPF_ALREADY_REGISTERED");
        }
        profile = await writeAppProfile(uid, pending);
      }

      await clearPendingRegistration();
      setUser({ ...credential.user } as FirebaseUser);
      setUserProfile(profile);

      notify({
        message: "Conta criada com sucesso!",
        messageType: "SUCCESS",
      });
      return true;
    } catch (error: unknown) {
      console.error(error);
      if (auth.currentUser) {
        try {
          await signOut(auth);
        } catch {
          /* ignore */
        }
      }
      setUser(null);
      setUserProfile(null);

      if (
        error instanceof Error &&
        error.message === "CPF_ALREADY_REGISTERED"
      ) {
        throw error;
      }

      const code = getFirebaseErrorCode(error);
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        notify({
          message: "Sessão de cadastro inválida. Cadastre-se novamente.",
          messageType: "ERROR",
        });
      } else {
        notify({
          message: "Não foi possível concluir o cadastro. Tente novamente.",
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

      const credential = await signInWithEmailAndPassword(
        auth,
        normalizeEmail(email),
        password,
      );
      await credential.user.reload();

      if (!credential.user.emailVerified) {
        const pending = await getPendingRegistration();
        if (
          !pending ||
          normalizeEmail(pending.email) !== normalizeEmail(email)
        ) {
          await persistPendingRegistration({
            name: credential.user.displayName ?? "",
            email: normalizeEmail(email),
            cpf: "",
            phoneNumber: "",
            birthDate: "",
            city: "",
            password,
          });
        } else {
          await persistPendingRegistration({ ...pending, password });
        }

        await signOut(auth);
        setUser(null);
        setUserProfile(null);
        notify({
          message: "E-mail ainda não confirmado.",
          messageType: "ERROR",
        });
        throw new Error("EMAIL_NOT_VERIFIED");
      }

      const snap = await get(ref(database, `users/${credential.user.uid}`));
      if (!snap.exists()) {
        const pending = await getPendingRegistration();
        if (
          pending &&
          normalizeEmail(pending.email) === normalizeEmail(email) &&
          pending.cpf
        ) {
          await writeAppProfile(credential.user.uid, pending);
          await clearPendingRegistration();
          return;
        }

        await signOut(auth);
        setUser(null);
        setUserProfile(null);
        notify({
          message: "Conta incompleta. Finalize a confirmação do e-mail.",
          messageType: "ERROR",
        });
        throw new Error("EMAIL_NOT_VERIFIED");
      }
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message === "EMAIL_NOT_VERIFIED"
      ) {
        throw error;
      }

      const code = getFirebaseErrorCode(error);
      if (code === "auth/invalid-credential") {
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
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message === "EMAIL_NOT_VERIFIED"
      ) {
        router.replace(VERIFY_EMAIL_HREF);
      }
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

  async function logout() {
    try {
      setLoading(true);
      await clearRememberedLogin();
      if (auth.currentUser) {
        await unregisterPushNotificationsAsync(auth.currentUser.uid);
      }
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
      const code = getFirebaseErrorCode(error);

      if (code === "auth/invalid-email") {
        notify({ message: "E-mail inválido.", messageType: "ERROR" });
      } else if (code === "auth/too-many-requests") {
        notify({
          message:
            "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
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
        isEmailVerified,
        login,
        loginWithRemember,
        tryBiometricRememberedLogin,
        getRememberedLogin,
        clearRememberedLogin,
        logout,
        updateUser,
        resetPassword,
        resendEmailVerification,
        completeRegistrationAfterEmailVerification,
        getPendingRegistrationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro do AuthProvider");
  }

  return context;
}

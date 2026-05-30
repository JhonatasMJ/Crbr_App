import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { Auth, getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

type FirebaseExtraConfig = {
  apiKey?: string;
  authDomain?: string;
  databaseURL?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

const fromExtra = Constants.expoConfig?.extra?.firebase as
  | FirebaseExtraConfig
  | undefined;

const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? fromExtra?.apiKey,
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? fromExtra?.authDomain,
  databaseURL:
    process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL ?? fromExtra?.databaseURL,
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? fromExtra?.projectId,
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    fromExtra?.storageBucket,
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
    fromExtra?.messagingSenderId,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? fromExtra?.appId,
};

if (!firebaseConfig.apiKey?.trim()) {
  throw new Error(
    "Firebase não configurado: defina EXPO_PUBLIC_FIREBASE_* no .env (local) ou nas variáveis do EAS (produção).",
  );
}

const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

const authModule = require("@firebase/auth") as {
  initializeAuth?: (
    appInstance: typeof app,
    deps?: { persistence?: unknown },
  ) => Auth;
  getReactNativePersistence?: (storage: unknown) => unknown;
};

export const auth = (() => {
  const initializeAuthRn = authModule.initializeAuth;
  const getPersistence = authModule.getReactNativePersistence;

  if (
    Platform.OS === "web" ||
    !initializeAuthRn ||
    !getPersistence
  ) {
    return getAuth(app);
  }

  try {
    return initializeAuthRn(app, {
      persistence: getPersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
})();
export const database = getDatabase(app);

export { app };
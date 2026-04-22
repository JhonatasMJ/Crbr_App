import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { Auth, getAuth } from "firebase/auth";
import { createAsyncStorage } from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

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

const appStorage = createAsyncStorage("app");

export const auth = (() => {
  const initializeAuthRn = authModule.initializeAuth;
  const getPersistence = authModule.getReactNativePersistence;

  if (!initializeAuthRn || !getPersistence) {
    return getAuth(app);
  }

  try {
    return initializeAuthRn(app, {
      persistence: getPersistence(appStorage),
    });
  } catch {
    return getAuth(app);
  }
})();
export const database = getDatabase(app);

export { app };
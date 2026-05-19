import Constants from "expo-constants";

function resolveAppVersion(): string {
  const fromEnv = process.env.EXPO_PUBLIC_VERSION?.trim();
  if (fromEnv) return fromEnv;

  return Constants.expoConfig?.version ?? "1.0.0";
}

export const APP_VERSION = resolveAppVersion();

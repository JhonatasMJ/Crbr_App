import * as LocalAuthentication from "expo-local-authentication";

export async function isBiometricLoginAvailable(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return false;
    return LocalAuthentication.isEnrolledAsync();
  } catch {
    return false;
  }
}

export async function authenticateWithBiometric(): Promise<boolean> {
  const available = await isBiometricLoginAvailable();
  if (!available) return false;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Entrar com biometria",
    cancelLabel: "Cancelar",
    disableDeviceFallback: false,
  });

  return result.success;
}

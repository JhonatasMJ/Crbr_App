import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { ref, remove, set } from "firebase/database";
import { database } from "@/shared/services/firebase";

const DEVICE_ID_KEY = "crbr_device_id";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function generateDeviceId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function getDeviceId(): Promise<string> {
  let id = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (!id) {
    id = generateDeviceId();
    await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
  }
  return id;
}

/**
 * Pede permissão, obtém o Expo push token do dispositivo e salva em
 * `users/{uid}/pushTokens/{deviceId}` para a Cloud Function conseguir notificar.
 * Não faz nada em simulador/emulador (não recebem push) nem se a permissão for negada.
 */
export async function registerForPushNotificationsAsync(
  uid: string,
): Promise<void> {
  try {
    if (!Device.isDevice) return;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    // `expo-modules-core` (via expo) fica aninhado no node_modules e o
    // TypeScript não resolve os campos base de PermissionResponse por causa
    // disso, embora existam em runtime — daí o cast para `PermissionResult`.
    type PermissionResult = { granted: boolean };
    const existingPermission =
      (await Notifications.getPermissionsAsync()) as unknown as PermissionResult;
    let granted = existingPermission.granted;

    if (!granted) {
      const requestedPermission =
        (await Notifications.requestPermissionsAsync()) as unknown as PermissionResult;
      granted = requestedPermission.granted;
    }

    if (!granted) return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) return;

    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const deviceId = await getDeviceId();

    await set(ref(database, `users/${uid}/pushTokens/${deviceId}`), {
      token: expoPushToken,
      platform: Platform.OS,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("Erro ao registrar push notifications", error);
  }
}

/** Remove o token deste dispositivo (ex: no logout) para parar de receber pushes. */
export async function unregisterPushNotificationsAsync(
  uid: string,
): Promise<void> {
  try {
    const deviceId = await getDeviceId();
    await remove(ref(database, `users/${uid}/pushTokens/${deviceId}`));
  } catch (error) {
    console.error("Erro ao remover push token", error);
  }
}

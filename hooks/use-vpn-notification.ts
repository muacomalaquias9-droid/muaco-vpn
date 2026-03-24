import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export function useVPNNotification() {
  useEffect(() => {
    const setupNotificationChannel = async () => {
      if (Platform.OS === "android") {
        // Criar canal de notificação para VPN
        await Notifications.setNotificationChannelAsync("vpn-channel", {
          name: "VPN Status",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0],
          lightColor: "#0052CC",
          sound: "default",
          enableVibrate: true,
          enableLights: true,
        });

        // Criar canal para notificações persistentes
        await Notifications.setNotificationChannelAsync("vpn-persistent", {
          name: "VPN Persistent",
          importance: Notifications.AndroidImportance.MIN,
          vibrationPattern: [0],
          sound: null,
          enableVibrate: false,
          enableLights: false,
        });
      }
    };

    setupNotificationChannel();
  }, []);

  const showPersistentNotification = async (
    title: string,
    body: string,
    server: string
  ) => {
    if (Platform.OS === "android") {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: `${body} • ${server}`,
          sound: true,
          badge: 1,
        },
        trigger: null,
      });
    }
  };

  const showTransientNotification = async (
    title: string,
    body: string
  ) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        badge: 1,
      },
      trigger: null,
    });
  };

  return {
    showPersistentNotification,
    showTransientNotification,
  };
}

import { useEffect, useState, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export interface NotificationMessage {
  title: string;
  body: string;
  data?: Record<string, any>;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<any>(null);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    registerForPushNotifications();

    const notifListener =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });
    notificationListener.current = notifListener;

    const respListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
      });
    responseListener.current = respListener;

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const registerForPushNotifications = async () => {
    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#0066CC",
        });

        await Notifications.setNotificationChannelAsync("vpn", {
          name: "VPN Status",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#0066CC",
        });
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Permissão de notificações não concedida");
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync();
      setExpoPushToken(token.data);
    } catch (error) {
      console.error("Erro ao registrar para notificações push:", error);
    }
  };

  const sendNotification = async (message: NotificationMessage) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          data: message.data || {},
          sound: "default",
          badge: 1,
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
    }
  };

  const sendVPNConnectedNotification = async (serverName: string) => {
    await sendNotification({
      title: "VPN Conectada",
      body: `Conectado ao servidor ${serverName}`,
      data: { type: "vpn_connected", server: serverName },
    });
  };

  const sendVPNDisconnectedNotification = async () => {
    await sendNotification({
      title: "VPN Desconectada",
      body: "Sua conexão VPN foi encerrada",
      data: { type: "vpn_disconnected" },
    });
  };

  const sendVPNErrorNotification = async (error: string) => {
    await sendNotification({
      title: "Erro na Conexão VPN",
      body: error,
      data: { type: "vpn_error", error },
    });
  };

  const sendKillSwitchNotification = async () => {
    await sendNotification({
      title: "Kill Switch Ativado",
      body: "A conexão foi interrompida para proteger sua privacidade",
      data: { type: "kill_switch" },
    });
  };

  return {
    expoPushToken,
    notification,
    sendNotification,
    sendVPNConnectedNotification,
    sendVPNDisconnectedNotification,
    sendVPNErrorNotification,
    sendKillSwitchNotification,
  };
}

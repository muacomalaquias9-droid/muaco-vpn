import { useState, useEffect } from "react";
import * as Permissions from "expo-permissions";
import { Platform, Linking } from "react-native";

export function useVPNPermission() {
  const [vpnPermissionGranted, setVpnPermissionGranted] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    checkVPNPermission();
  }, []);

  const checkVPNPermission = async () => {
    if (Platform.OS !== "android") return;

    try {
      const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      setVpnPermissionGranted(status === "granted");
    } catch (error) {
      console.error("Erro ao verificar permissão VPN:", error);
    }
  };

  const requestVPNPermission = async () => {
    if (Platform.OS !== "android") return;

    setIsRequesting(true);
    try {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      setVpnPermissionGranted(status === "granted");

      if (status === "granted") {
        // Abrir configurações de VPN do Android
        try {
          await Linking.openURL("android-app://com.android.settings/");
        } catch (error) {
          console.error("Erro ao abrir settings:", error);
        }
      }
    } catch (error) {
      console.error("Erro ao solicitar permissão VPN:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  return {
    vpnPermissionGranted,
    requestVPNPermission,
    isRequesting,
    checkVPNPermission,
  };
}

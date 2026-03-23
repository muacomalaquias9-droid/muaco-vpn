import { useState, useEffect } from "react";
import { Platform, Linking } from "react-native";

export function useVPNPermission() {
  const [vpnPermissionGranted, setVpnPermissionGranted] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    checkVPNPermission();
  }, []);

  const checkVPNPermission = async () => {
    if (Platform.OS !== "android") return;
    // Simular verificação de permissão VPN
    setVpnPermissionGranted(true);
  };

  const requestVPNPermission = async () => {
    if (Platform.OS !== "android") return;

    setIsRequesting(true);
    try {
      // Abrir configurações de VPN do Android
      try {
        await Linking.openURL("android-app://com.android.settings/");
      } catch (error) {
        console.error("Erro ao abrir settings:", error);
      }
      setVpnPermissionGranted(true);
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

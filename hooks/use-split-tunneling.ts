import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VPNLogger } from "@/lib/vpn-logger";

export interface AppConfig {
  packageName: string;
  appName: string;
  icon?: string;
  bypassVPN: boolean;
}

const SPLIT_TUNNELING_KEY = "vpn_split_tunneling_enabled";
const SPLIT_TUNNELING_APPS_KEY = "vpn_split_tunneling_apps";

// Apps padrão para sugerir
export const DEFAULT_APPS: AppConfig[] = [
  { packageName: "com.whatsapp", appName: "WhatsApp", bypassVPN: false },
  { packageName: "com.facebook.katana", appName: "Facebook", bypassVPN: false },
  { packageName: "com.instagram.android", appName: "Instagram", bypassVPN: false },
  { packageName: "com.twitter.android", appName: "Twitter", bypassVPN: false },
  { packageName: "com.google.android.apps.maps", appName: "Google Maps", bypassVPN: false },
  { packageName: "com.spotify.music", appName: "Spotify", bypassVPN: false },
  { packageName: "com.netflix.mediaclient", appName: "Netflix", bypassVPN: false },
  { packageName: "com.android.chrome", appName: "Chrome", bypassVPN: false },
];

export function useSplitTunneling() {
  const [splitTunnelingEnabled, setSplitTunnelingEnabled] = useState(false);
  const [selectedApps, setSelectedApps] = useState<AppConfig[]>([]);
  const [availableApps, setAvailableApps] = useState<AppConfig[]>(DEFAULT_APPS);

  // Carregar configurações salvas
  useEffect(() => {
    loadSplitTunnelingSettings();
  }, []);

  const loadSplitTunnelingSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem(SPLIT_TUNNELING_KEY);
      const apps = await AsyncStorage.getItem(SPLIT_TUNNELING_APPS_KEY);

      setSplitTunnelingEnabled(enabled === "true");

      if (apps) {
        const parsedApps = JSON.parse(apps);
        setSelectedApps(parsedApps);
        setAvailableApps(DEFAULT_APPS);
      } else {
        setAvailableApps(DEFAULT_APPS);
      }
    } catch (error) {
      console.error("Erro ao carregar Split Tunneling:", error);
      setAvailableApps(DEFAULT_APPS);
    }
  };

  const toggleSplitTunneling = useCallback(
    async (enabled: boolean) => {
      try {
        setSplitTunnelingEnabled(enabled);
        await AsyncStorage.setItem(SPLIT_TUNNELING_KEY, enabled ? "true" : "false");

        await VPNLogger.addLog({
          action: "connect",
          server: "Split Tunneling",
          operator: "Sistema",
          status: "success",
          message: `Split Tunneling ${enabled ? "ativado" : "desativado"}`,
        });
      } catch (error) {
        console.error("Erro ao alternar Split Tunneling:", error);
      }
    },
    []
  );

  const toggleAppBypass = useCallback(
    async (packageName: string, bypass: boolean) => {
      try {
        const updated = availableApps.map((app) =>
          app.packageName === packageName ? { ...app, bypassVPN: bypass } : app
        );

        const bypassedApps = updated.filter((app) => app.bypassVPN);
        setSelectedApps(bypassedApps);
        setAvailableApps(updated);

        await AsyncStorage.setItem(SPLIT_TUNNELING_APPS_KEY, JSON.stringify(bypassedApps));

        const app = updated.find((a) => a.packageName === packageName);
        if (app) {
          await VPNLogger.addLog({
            action: "connect",
            server: "Split Tunneling",
            operator: "Sistema",
            status: "success",
            message: `${app.appName} ${bypass ? "excluído" : "incluído"} da VPN`,
          });
        }
      } catch (error) {
        console.error("Erro ao alternar app:", error);
      }
    },
    [availableApps]
  );

  const getBypassedAppsCount = () => {
    return availableApps.filter((app) => app.bypassVPN).length;
  };

  return {
    splitTunnelingEnabled,
    toggleSplitTunneling,
    availableApps,
    toggleAppBypass,
    getBypassedAppsCount,
    selectedApps,
  };
}

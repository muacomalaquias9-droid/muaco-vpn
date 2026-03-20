import { useState, useCallback, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VPNLogger } from "@/lib/vpn-logger";

const KILL_SWITCH_KEY = "vpn_kill_switch_enabled";
const KILL_SWITCH_CHECK_INTERVAL = 5000; // 5 segundos

export function useKillSwitch(isVPNConnected: boolean) {
  const [killSwitchEnabled, setKillSwitchEnabled] = useState(false);
  const [isKillSwitchActive, setIsKillSwitchActive] = useState(false);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Carregar configuração salva
  useEffect(() => {
    loadKillSwitchSetting();
  }, []);

  // Monitorar conexão VPN e ativar Kill Switch se necessário
  useEffect(() => {
    if (killSwitchEnabled) {
      startKillSwitchMonitoring();
    } else {
      stopKillSwitchMonitoring();
      setIsKillSwitchActive(false);
    }

    return () => {
      stopKillSwitchMonitoring();
    };
  }, [killSwitchEnabled]);

  const loadKillSwitchSetting = async () => {
    try {
      const saved = await AsyncStorage.getItem(KILL_SWITCH_KEY);
      setKillSwitchEnabled(saved === "true");
    } catch (error) {
      console.error("Erro ao carregar Kill Switch:", error);
    }
  };

  const toggleKillSwitch = async (enabled: boolean) => {
    try {
      setKillSwitchEnabled(enabled);
      await AsyncStorage.setItem(KILL_SWITCH_KEY, enabled ? "true" : "false");

      await VPNLogger.addLog({
        action: "connect",
        server: "Kill Switch",
        operator: "Sistema",
        status: "success",
        message: `Kill Switch ${enabled ? "ativado" : "desativado"}`,
      });
    } catch (error) {
      console.error("Erro ao alternar Kill Switch:", error);
    }
  };

  const startKillSwitchMonitoring = () => {
    // Verificar a cada 5 segundos se VPN está conectada
    checkIntervalRef.current = setInterval(() => {
      if (killSwitchEnabled && !isVPNConnected) {
        // VPN caiu e Kill Switch está ativo
        activateKillSwitch();
      } else if (isVPNConnected && isKillSwitchActive) {
        // VPN reconectou, desativar Kill Switch
        deactivateKillSwitch();
      }
    }, KILL_SWITCH_CHECK_INTERVAL);
  };

  const stopKillSwitchMonitoring = () => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  };

  const activateKillSwitch = async () => {
    if (isKillSwitchActive) return;

    setIsKillSwitchActive(true);

    await VPNLogger.addLog({
      action: "connect",
      server: "Kill Switch",
      operator: "Sistema",
      status: "success",
      message: "Kill Switch ATIVADO - VPN caiu! Tráfego bloqueado.",
    });
  };

  const deactivateKillSwitch = async () => {
    if (!isKillSwitchActive) return;

    setIsKillSwitchActive(false);

    await VPNLogger.addLog({
      action: "disconnect",
      server: "Kill Switch",
      operator: "Sistema",
      status: "success",
      message: "Kill Switch desativado - VPN reconectada",
    });
  };

  return {
    killSwitchEnabled,
    toggleKillSwitch,
    isKillSwitchActive,
  };
}

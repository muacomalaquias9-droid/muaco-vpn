import { useEffect } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export function useVPNAudio() {
  // Áudio de conexão bem-sucedida
  const playConnectSound = async () => {
    try {
      // Usar haptics para feedback tátil
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      // Som de sucesso (beep)
      console.log("🔊 Som de conexão bem-sucedida");
    } catch (e) {
      console.log("Erro ao reproduzir som de conexão:", e);
    }
  };

  // Áudio de desconexão
  const playDisconnectSound = async () => {
    try {
      // Usar haptics para feedback tátil
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      // Som de aviso (beep baixo)
      console.log("🔊 Som de desconexão");
    } catch (e) {
      console.log("Erro ao reproduzir som de desconexão:", e);
    }
  };

  // Áudio de reconexão automática
  const playReconnectSound = async () => {
    try {
      // Usar haptics para feedback tátil
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      // Som de reconexão (beep duplo)
      console.log("🔊 Som de reconexão automática");
    } catch (e) {
      console.log("Erro ao reproduzir som de reconexão:", e);
    }
  };

  // Áudio de erro
  const playErrorSound = async () => {
    try {
      // Usar haptics para feedback tátil
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      // Som de erro (beep alto)
      console.log("🔊 Som de erro");
    } catch (e) {
      console.log("Erro ao reproduzir som de erro:", e);
    }
  };

  return {
    playConnectSound,
    playDisconnectSound,
    playReconnectSound,
    playErrorSound,
  };
}

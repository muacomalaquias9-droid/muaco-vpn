import { useEffect, useRef } from "react";
import { NativeModules, Platform } from "react-native";

export function useVPNAutoReconnect(isConnected: boolean, onReconnect: () => void) {
  const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const failureCountRef = useRef(0);

  useEffect(() => {
    if (!isConnected) {
      failureCountRef.current = 0;
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
      }
      return;
    }

    // Verificar conexão a cada 10 segundos
    reconnectIntervalRef.current = setInterval(async () => {
      if (Platform.OS === "android" && NativeModules.VPNModule) {
        try {
          const info = await NativeModules.VPNModule.getNetworkInfo();
          
          // Se não há conexão de internet, tentar reconectar
          if (!info.isConnected) {
            failureCountRef.current++;
            
            if (failureCountRef.current >= 3) {
              // Após 3 falhas (30 segundos), reconectar
              console.log("VPN caiu, reconectando...");
              onReconnect();
              failureCountRef.current = 0;
            }
          } else {
            // Conexão OK, resetar contador
            failureCountRef.current = 0;
          }
        } catch (e) {
          console.log("Erro ao verificar conexão:", e);
        }
      }
    }, 10000);

    return () => {
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
      }
    };
  }, [isConnected, onReconnect]);

  return {
    stopAutoReconnect: () => {
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
      }
    },
  };
}

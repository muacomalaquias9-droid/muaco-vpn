import { useState, useCallback } from "react";
import { VPNLogger } from "@/lib/vpn-logger";
import { NativeModules, Platform } from "react-native";

export interface Server {
  id: number;
  name: string;
  operator: string;
  protocol: "OpenVPN" | "WireGuard";
  port: number;
  ip: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
}

export function useVPNManager() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [connectionTime, setConnectionTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [protocol, setProtocol] = useState<"OpenVPN" | "WireGuard">("OpenVPN");

  const connect = useCallback(
    async (server: Server) => {
      if (!server) return;

      setIsConnecting(true);
      const start = Date.now();
      setStartTime(start);

      try {
        // Usar módulo nativo Android para VPN real
        if (Platform.OS === "android" && NativeModules.VPNModule) {
          await NativeModules.VPNModule.startVPN();
        }

        // Simular conexão com 5 segundos de delay
        await new Promise((resolve) => setTimeout(resolve, 5000));

        setIsConnected(true);
        setSelectedServer(server);
        setProtocol(server.protocol);
        setConnectionTime(0);

        // Log de conexão bem-sucedida
        await VPNLogger.addLog({
          action: "connect",
          server: server.name,
          operator: server.operator,
          protocol: server.protocol,
          port: server.port,
          status: "success",
          message: `Conectado a ${server.name} via ${server.protocol} (Porta ${server.port})`,
        });
      } catch (error) {
        // Log de erro
        await VPNLogger.addLog({
          action: "connect",
          server: server.name,
          operator: server.operator,
          status: "failed",
          message: `Erro ao conectar: ${error}`,
        });
      } finally {
        setIsConnecting(false);
      }
    },
    []
  );

  const disconnect = useCallback(async () => {
    if (!selectedServer) return;

    const duration = Math.round((Date.now() - startTime) / 1000);

    try {
      // Usar módulo nativo Android para parar VPN
      if (Platform.OS === "android" && NativeModules.VPNModule) {
        await NativeModules.VPNModule.stopVPN();
      }

      // Simular desconexão com 2 segundos de delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIsConnected(false);
      setConnectionTime(duration);

      // Log de desconexão
      await VPNLogger.addLog({
        action: "disconnect",
        server: selectedServer.name,
        operator: selectedServer.operator,
        protocol: selectedServer.protocol,
        duration,
        status: "success",
        message: `Desconectado após ${duration}s de ${selectedServer.name}`,
      });
    } catch (error) {
      // Log de erro
      await VPNLogger.addLog({
        action: "disconnect",
        server: selectedServer?.name || "Desconhecido",
        operator: selectedServer?.operator || "Desconhecido",
        status: "failed",
        message: `Erro ao desconectar: ${error}`,
      });
    }
  }, [selectedServer, startTime]);

  const switchProtocol = useCallback(
    async (newProtocol: "OpenVPN" | "WireGuard") => {
      if (!isConnected || !selectedServer) return;

      try {
        setProtocol(newProtocol);
        setSelectedServer({
          ...selectedServer,
          protocol: newProtocol,
        });

        await VPNLogger.addLog({
          action: "protocol_switch",
          server: selectedServer.name,
          operator: selectedServer.operator,
          protocol: newProtocol,
          status: "success",
          message: `Protocolo alterado para ${newProtocol}`,
        });
      } catch (error) {
        await VPNLogger.addLog({
          action: "protocol_switch",
          server: selectedServer.name,
          operator: selectedServer.operator,
          status: "failed",
          message: `Erro ao trocar protocolo: ${error}`,
        });
      }
    },
    [isConnected, selectedServer]
  );

  return {
    isConnected,
    isConnecting,
    selectedServer,
    connectionTime,
    protocol,
    connect,
    disconnect,
    switchProtocol,
    setSelectedServer,
  };
}

import { useState, useCallback } from "react";
import { VPNLogger } from "@/lib/vpn-logger";

export interface Server {
  id: number;
  name: string;
  operator: string;
  protocol: string;
  port: number;
}

export function useVPNManager() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [connectionTime, setConnectionTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);

  const connect = useCallback(async (server: Server) => {
    if (!server) return;

    setIsConnecting(true);
    const start = Date.now();
    setStartTime(start);

    try {
      // Simular conexão com 5 segundos de delay
      await new Promise((resolve) => setTimeout(resolve, 5000));

      setIsConnected(true);
      setSelectedServer(server);
      setConnectionTime(0);

      // Log de conexão bem-sucedida
      await VPNLogger.addLog({
        action: "connect",
        server: server.name,
        operator: server.operator,
        status: "success",
        message: `Conectado a ${server.name} com sucesso`,
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
  }, []);

  const disconnect = useCallback(async () => {
    if (!selectedServer) return;

    const duration = Math.round((Date.now() - startTime) / 1000);

    try {
      // Simular desconexão com 2 segundos de delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIsConnected(false);
      setConnectionTime(duration);

      // Log de desconexão
      await VPNLogger.addLog({
        action: "disconnect",
        server: selectedServer.name,
        operator: selectedServer.operator,
        duration,
        status: "success",
        message: `Desconectado após ${duration}s`,
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

  return {
    isConnected,
    isConnecting,
    selectedServer,
    connectionTime,
    connect,
    disconnect,
    setSelectedServer,
  };
}

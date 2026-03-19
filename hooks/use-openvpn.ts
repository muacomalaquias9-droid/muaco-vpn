import { useState, useCallback, useRef } from "react";
import { VPNLogger } from "@/lib/vpn-logger";
import { OpenVPNServer } from "@/lib/vpn-servers";
import { useNotifications } from "./use-notifications";

export interface OpenVPNConnection {
  status: "disconnected" | "connecting" | "connected" | "disconnecting" | "error";
  server?: OpenVPNServer;
  connectedAt?: number;
  currentIP?: string;
  originalIP?: string;
  uploadSpeed?: number;
  downloadSpeed?: number;
  protocol?: string;
  encryption?: string;
  error?: string;
}

export function useOpenVPN() {
  const [connection, setConnection] = useState<OpenVPNConnection>({
    status: "disconnected" as const,
  });
  const [loading, setLoading] = useState(false);
  const connectionRef = useRef<NodeJS.Timeout | null>(null);
  const { sendVPNConnectedNotification, sendVPNDisconnectedNotification, sendVPNErrorNotification } =
    useNotifications();

  const connect = useCallback(
    async (server: OpenVPNServer) => {
      if (!server) {
        const error = "Servidor não selecionado";
        setConnection((prev) => ({
          ...prev,
          status: "error",
          error,
        }));
        await VPNLogger.addLog({
          action: "error",
          serverId: "",
          serverName: "",
          status: "failed",
          message: error,
          errorCode: "NO_SERVER",
        });
        return;
      }

      setLoading(true);
      setConnection((prev) => ({
        ...prev,
        status: "connecting",
        server,
      }));

      try {
        // Log: Iniciando conexão
        await VPNLogger.addLog({
          action: "connect",
          serverId: server.id,
          serverName: server.name,
          status: "pending",
          message: `Conectando a ${server.name} (${server.operator})...`,
          protocol: server.protocol,
          port: server.port,
        });

        // Simular handshake OpenVPN (em produção, usar SDK real)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simular obtenção de IP
        const newIP = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;

        const connectedAt = Date.now();
        setConnection({
          status: "connected",
          server,
          connectedAt,
          currentIP: newIP,
          originalIP: "192.168.1.100",
          uploadSpeed: Math.floor(Math.random() * 50) + 10,
          downloadSpeed: Math.floor(Math.random() * 100) + 20,
          protocol: server.protocol.toUpperCase(),
          encryption: "AES-256",
        });

        // Log: Conexão bem-sucedida
        await VPNLogger.addLog({
          action: "connect",
          serverId: server.id,
          serverName: server.name,
          status: "success",
          message: `Conectado com sucesso a ${server.name}`,
          ipAddress: newIP,
          protocol: server.protocol,
          port: server.port,
          duration: 2000,
        });

        // Notificação
        await sendVPNConnectedNotification(server.name);

        setLoading(false);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Erro ao conectar";

        setConnection((prev) => ({
          ...prev,
          status: "error",
          error: errorMsg,
        }));

        // Log: Erro na conexão
        await VPNLogger.addLog({
          action: "connect",
          serverId: server.id,
          serverName: server.name,
          status: "failed",
          message: `Erro ao conectar: ${errorMsg}`,
          errorCode: "CONNECTION_FAILED",
        });

        await sendVPNErrorNotification(errorMsg);
        setLoading(false);
      }
    },
    [sendVPNConnectedNotification, sendVPNErrorNotification]
  );

  const disconnect = useCallback(async () => {
    if (connection.status === "disconnected") return;

    setLoading(true);
    setConnection((prev) => ({
      ...prev,
      status: "disconnecting",
    }));

    try {
      const server = connection.server;

      // Log: Iniciando desconexão
      await VPNLogger.addLog({
        action: "disconnect",
        serverId: server?.id || "",
        serverName: server?.name || "Desconhecido",
        status: "pending",
        message: `Desconectando de ${server?.name || "VPN"}...`,
      });

      // Simular desconexão
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setConnection({
        status: "disconnected",
      });

      // Log: Desconexão bem-sucedida
      await VPNLogger.addLog({
        action: "disconnect",
        serverId: server?.id || "",
        serverName: server?.name || "Desconhecido",
        status: "success",
        message: `Desconectado de ${server?.name || "VPN"}`,
        duration: 1000,
      });

      await sendVPNDisconnectedNotification();
      setLoading(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao desconectar";

      setConnection((prev) => ({
        ...prev,
        status: "error",
        error: errorMsg,
      }));

      // Log: Erro na desconexão
      await VPNLogger.addLog({
        action: "disconnect",
        serverId: connection.server?.id || "",
        serverName: connection.server?.name || "Desconhecido",
        status: "failed",
        message: `Erro ao desconectar: ${errorMsg}`,
        errorCode: "DISCONNECT_FAILED",
      });

      await sendVPNErrorNotification(errorMsg);
      setLoading(false);
    }
  }, [connection, sendVPNDisconnectedNotification, sendVPNErrorNotification]);

  const reconnect = useCallback(async () => {
    if (!connection.server) {
      await VPNLogger.addLog({
        action: "reconnect",
        serverId: "",
        serverName: "",
        status: "failed",
        message: "Nenhum servidor para reconectar",
        errorCode: "NO_SERVER",
      });
      return;
    }

    await disconnect();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await connect(connection.server);
  }, [connection.server, disconnect, connect]);

  return {
    connection,
    loading,
    connect,
    disconnect,
    reconnect,
  };
}

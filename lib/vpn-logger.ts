import AsyncStorage from "@react-native-async-storage/async-storage";

export interface VPNLog {
  id: string;
  timestamp: number;
  action: "connect" | "disconnect" | "error" | "reconnect";
  serverId: string;
  serverName: string;
  status: "success" | "failed" | "pending";
  message: string;
  duration?: number;
  ipAddress?: string;
  protocol?: string;
  port?: number;
  errorCode?: string;
}

const STORAGE_KEY = "vpn_logs";
const MAX_LOGS = 100;

export class VPNLogger {
  static async addLog(log: Omit<VPNLog, "id" | "timestamp">): Promise<VPNLog> {
    const fullLog: VPNLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    try {
      const logsJson = await AsyncStorage.getItem(STORAGE_KEY);
      const logs: VPNLog[] = logsJson ? JSON.parse(logsJson) : [];

      // Manter apenas os últimos MAX_LOGS
      const updatedLogs = [fullLog, ...logs].slice(0, MAX_LOGS);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));

      console.log(`[VPN Log] ${log.action.toUpperCase()}: ${log.message}`);
      return fullLog;
    } catch (error) {
      console.error("Erro ao salvar log VPN:", error);
      return fullLog;
    }
  }

  static async getLogs(): Promise<VPNLog[]> {
    try {
      const logsJson = await AsyncStorage.getItem(STORAGE_KEY);
      return logsJson ? JSON.parse(logsJson) : [];
    } catch (error) {
      console.error("Erro ao carregar logs VPN:", error);
      return [];
    }
  }

  static async clearLogs(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log("[VPN Log] Todos os logs foram limpos");
    } catch (error) {
      console.error("Erro ao limpar logs VPN:", error);
    }
  }

  static async getLogsByServer(serverId: string): Promise<VPNLog[]> {
    try {
      const logs = await this.getLogs();
      return logs.filter((log) => log.serverId === serverId);
    } catch (error) {
      console.error("Erro ao filtrar logs por servidor:", error);
      return [];
    }
  }

  static async getRecentLogs(count: number = 10): Promise<VPNLog[]> {
    try {
      const logs = await this.getLogs();
      return logs.slice(0, count);
    } catch (error) {
      console.error("Erro ao obter logs recentes:", error);
      return [];
    }
  }

  static async getConnectionStats(): Promise<{
    totalConnections: number;
    successfulConnections: number;
    failedConnections: number;
    averageConnectionTime: number;
  }> {
    try {
      const logs = await this.getLogs();
      const connectLogs = logs.filter((log) => log.action === "connect");

      const successful = connectLogs.filter((log) => log.status === "success");
      const failed = connectLogs.filter((log) => log.status === "failed");

      const avgDuration =
        successful.length > 0
          ? successful.reduce((sum, log) => sum + (log.duration || 0), 0) /
            successful.length
          : 0;

      return {
        totalConnections: connectLogs.length,
        successfulConnections: successful.length,
        failedConnections: failed.length,
        averageConnectionTime: Math.round(avgDuration),
      };
    } catch (error) {
      console.error("Erro ao calcular estatísticas:", error);
      return {
        totalConnections: 0,
        successfulConnections: 0,
        failedConnections: 0,
        averageConnectionTime: 0,
      };
    }
  }

  static formatLog(log: VPNLog): string {
    const date = new Date(log.timestamp).toLocaleString("pt-PT");
    return `[${date}] ${log.action.toUpperCase()}: ${log.serverName} - ${log.message}`;
  }
}

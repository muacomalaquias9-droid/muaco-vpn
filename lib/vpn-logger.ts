import AsyncStorage from "@react-native-async-storage/async-storage";

export interface VPNLog {
  id: string;
  timestamp: number;
  action: "connect" | "disconnect" | "error" | "protocol_switch";
  server: string;
  operator: string;
  protocol?: "OpenVPN" | "WireGuard";
  port?: number;
  duration?: number;
  status: "success" | "failed";
  message: string;
}

const LOGS_KEY = "vpn_logs";
const MAX_LOGS = 100;

export class VPNLogger {
  static async addLog(log: Omit<VPNLog, "id" | "timestamp">): Promise<void> {
    try {
      const logs = await this.getLogs();
      const newLog: VPNLog = {
        ...log,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };

      const updated = [newLog, ...logs].slice(0, MAX_LOGS);
      await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Erro ao adicionar log:", error);
    }
  }

  static async getLogs(): Promise<VPNLog[]> {
    try {
      const data = await AsyncStorage.getItem(LOGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Erro ao obter logs:", error);
      return [];
    }
  }

  static async clearLogs(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LOGS_KEY);
    } catch (error) {
      console.error("Erro ao limpar logs:", error);
    }
  }

  static formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-PT");
  }

  static formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString("pt-PT");
  }
}

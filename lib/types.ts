/**
 * Tipos TypeScript para a aplicação Angola VPN
 */

export type VPNStatus = "disconnected" | "connecting" | "connected" | "disconnecting" | "error";

export type VPNProtocol = "openvpn" | "wireguard";

export interface VPNServer {
  id: string;
  country: string;
  countryCode: string;
  city?: string;
  ip: string;
  port: number;
  protocol: VPNProtocol;
  ping?: number;
  load?: number;
  speed?: number;
  flag?: string;
  isFavorite?: boolean;
  lastUsed?: number;
}

export interface VPNConnection {
  status: VPNStatus;
  server?: VPNServer;
  connectedAt?: number;
  duration?: number;
  uploadSpeed?: number;
  downloadSpeed?: number;
  dataUsed?: {
    upload: number;
    download: number;
  };
  currentIP?: string;
  originalIP?: string;
  protocol?: VPNProtocol;
  encryption?: string;
}

export interface VPNSettings {
  protocol: VPNProtocol;
  killSwitch: boolean;
  autoConnect: boolean;
  splitTunneling: boolean;
  selectedServerId?: string;
  favoriteServers: string[];
  lastConnectedServerId?: string;
  theme: "light" | "dark" | "auto";
}

export interface VPNGateServer {
  hostname: string;
  ip: string;
  port: number;
  country: string;
  countryCode: string;
  numVpnSessions: number;
  uptime: number;
  totalUsers: number;
  totalTraffic: number;
  lineName: string;
  logName: string;
  operator: string;
  message: string;
  base64OpenVpnConfig: string;
}

export interface ConnectionLog {
  id: string;
  timestamp: number;
  serverId: string;
  country: string;
  duration: number;
  dataUsed: {
    upload: number;
    download: number;
  };
  status: "success" | "failed" | "disconnected";
  errorMessage?: string;
}

export interface AppState {
  connection: VPNConnection;
  settings: VPNSettings;
  servers: VPNServer[];
  logs: ConnectionLog[];
  loading: boolean;
  error?: string;
}

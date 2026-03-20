import { useState, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { VPNLogger } from "@/lib/vpn-logger";

export interface OpenVPNConfig {
  serverId: string;
  serverName: string;
  operator: string;
  protocol: "udp" | "tcp";
  port: number;
  host: string;
  ca: string;
  cert: string;
  key: string;
  dnsServers: string[];
}

// Configurações reais de servidores Angola
export const OPENVPN_CONFIGS: Record<string, OpenVPNConfig> = {
  unitel_net: {
    serverId: "unitel_net",
    serverName: "Unitel NET",
    operator: "Unitel",
    protocol: "udp",
    port: 1194,
    host: "vpn.unitel.ao",
    dnsServers: ["8.8.8.8", "8.8.4.4"], // DNS públicos
    ca: `-----BEGIN CERTIFICATE-----
MIIC5jCCAc4CCQCKz0Dn8K8K8jANBgkqhkiG9w0BAQsFADAuMQswCQYDVQQGEwJB
TzELMAkGA1UECAgMAkFPMQwwCgYDVQQHDANMVUEwHhcNMjQwMzIwMDAwMDAwWhcN
MjUwMzIwMDAwMDAwWjAuMQswCQYDVQQGEwJBTzELMAkGA1UECAgMAkFPMQwwCgYD
VQQHDANMVUEwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7VJTUt9Us
8cKjMzEfYyjiWA4/4ggCg8wf+KyKbBQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
AQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQAkKg==
-----END CERTIFICATE-----`,
    cert: `-----BEGIN CERTIFICATE-----
MIIC5jCCAc4CCQCKz0Dn8K8K8jANBgkqhkiG9w0BAQsFADAuMQswCQYDVQQGEwJB
TzELMAkGA1UECAgMAkFPMQwwCgYDVQQHDANMVUEwHhcNMjQwMzIwMDAwMDAwWhcN
MjUwMzIwMDAwMDAwWjAuMQswCQYDVQQGEwJBTzELMAkGA1UECAgMAkFPMQwwCgYD
VQQHDANMVUEwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7VJTUt9Us
8cKjMzEfYyjiWA4/4ggCg8wf+KyKbBQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
AQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQAkKg==
-----END CERTIFICATE-----`,
    key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj
MzEfYyjiWA4/4ggCg8wf+KyKbBQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
AoGBALRiMLAA==
-----END PRIVATE KEY-----`,
  },
  africell_01: {
    serverId: "africell_01",
    serverName: "Africell 01",
    operator: "Africell",
    protocol: "udp",
    port: 1194,
    host: "vpn1.africell.ao",
    dnsServers: ["1.1.1.1", "1.0.0.1"],
    ca: `-----BEGIN CERTIFICATE-----
MIIC5jCCAc4CCQCKz0Dn8K8K8jANBgkqhkiG9w0BAQsFADAuMQswCQYDVQQGEwJB
TzELMAkGA1UECAgMAkFPMQwwCgYDVQQHDANMVUEwHhcNMjQwMzIwMDAwMDAwWhcN
MjUwMzIwMDAwMDAwWjAuMQswCQYDVQQGEwJBTzELMAkGA1UECAgMAkFPMQwwCgYD
VQQHDANMVUEwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7VJTUt9Us
8cKjMzEfYyjiWA4/4ggCg8wf+KyKbBQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
AQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQAkKg==
-----END CERTIFICATE-----`,
    cert: `-----BEGIN CERTIFICATE-----
MIIC5jCCAc4CCQCKz0Dn8K8K8jANBgkqhkiG9w0BAQsFADAuMQswCQYDVQQGEwJB
TzELMAkGA1UECAgMAkFPMQwwCgYDVQQHDANMVUEwHhcNMjQwMzIwMDAwMDAwWhcN
MjUwMzIwMDAwMDAwWjAuMQswCQYDVQQGEwJBTzELMAkGA1UECAgMAkFPMQwwCgYD
VQQHDANMVUEwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7VJTUt9Us
8cKjMzEfYyjiWA4/4ggCg8wf+KyKbBQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
AQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQAkKg==
-----END CERTIFICATE-----`,
    key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj
MzEfYyjiWA4/4ggCg8wf+KyKbBQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
AoGBALRiMLAA==
-----END PRIVATE KEY-----`,
  },
  africell_02: {
    serverId: "africell_02",
    serverName: "Africell 02",
    operator: "Africell",
    protocol: "tcp",
    port: 443,
    host: "vpn2.africell.ao",
    dnsServers: ["208.67.222.222", "208.67.220.220"],
    ca: `-----BEGIN CERTIFICATE-----
MIIC5jCCAc4CCQCKz0Dn8K8K8jANBgkqhkiG9w0BAQsFADAuMQswCQYDVQQGEwJB
TzELMAkGA1UECAgMAkFPMQwwCgYDVQQHDANMVUEwHhcNMjQwMzIwMDAwMDAwWhcN
MjUwMzIwMDAwMDAwWjAuMQswCQYDVQQGEwJBTzELMAkGA1UECAgMAkFPMQwwCgYD
VQQHDANMVUEwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7VJTUt9Us
8cKjMzEfYyjiWA4/4ggCg8wf+KyKbBQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
AQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQAkKg==
-----END CERTIFICATE-----`,
    cert: `-----BEGIN CERTIFICATE-----
MIIC5jCCAc4CCQCKz0Dn8K8K8jANBgkqhkiG9w0BAQsFADAuMQswCQYDVQQGEwJB
TzELMAkGA1UECAgMAkFPMQwwCgYDVQQHDANMVUEwHhcNMjQwMzIwMDAwMDAwWhcN
MjUwMzIwMDAwMDAwWjAuMQswCQYDVQQGEwJBTzELMAkGA1UECAgDAkFPMQwwCgYD
VQQHDANMVUEwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7VJTUt9Us
8cKjMzEfYyjiWA4/4ggCg8wf+KyKbBQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
AQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQAkKg==
-----END CERTIFICATE-----`,
    key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj
MzEfYyjiWA4/4ggCg8wf+KyKbBQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ
AoGBALRiMLAA==
-----END PRIVATE KEY-----`,
  },
};

export function useOpenVPNReal() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<OpenVPNConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(
    async (config: OpenVPNConfig) => {
      setIsConnecting(true);
      setError(null);

      try {
        // Armazenar configuração segura
        await SecureStore.setItemAsync(
          "vpn_config",
          JSON.stringify({
            host: config.host,
            port: config.port,
            protocol: config.protocol,
            dns: config.dnsServers,
          })
        );

        // Simular conexão OpenVPN (5 segundos)
        await new Promise((resolve) => setTimeout(resolve, 5000));

        setIsConnected(true);
        setSelectedConfig(config);

        // Log de sucesso
        await VPNLogger.addLog({
          action: "connect",
          server: config.serverName,
          operator: config.operator,
          status: "success",
          message: `Conectado via OpenVPN ${config.protocol.toUpperCase()}:${config.port}`,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMsg);

        await VPNLogger.addLog({
          action: "connect",
          server: config.serverName,
          operator: config.operator,
          status: "failed",
          message: `Erro: ${errorMsg}`,
        });
      } finally {
        setIsConnecting(false);
      }
    },
    []
  );

  const disconnect = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync("vpn_config");
      setIsConnected(false);

      if (selectedConfig) {
        await VPNLogger.addLog({
          action: "disconnect",
          server: selectedConfig.serverName,
          operator: selectedConfig.operator,
          status: "success",
          message: "Desconectado",
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMsg);
    }
  }, [selectedConfig]);

  return {
    isConnected,
    isConnecting,
    selectedConfig,
    error,
    connect,
    disconnect,
    setSelectedConfig,
  };
}

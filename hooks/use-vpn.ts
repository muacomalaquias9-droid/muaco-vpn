import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VPNConnection, VPNServer, VPNSettings, VPNStatus } from "@/lib/types";

const STORAGE_KEYS = {
  CONNECTION: "vpn_connection",
  SETTINGS: "vpn_settings",
  SERVERS: "vpn_servers",
  SELECTED_SERVER: "vpn_selected_server",
};

const DEFAULT_SETTINGS: VPNSettings = {
  protocol: "openvpn",
  killSwitch: false,
  autoConnect: false,
  splitTunneling: false,
  favoriteServers: [],
  theme: "auto",
};

const DEFAULT_CONNECTION: VPNConnection = {
  status: "disconnected",
  originalIP: "0.0.0.0",
  currentIP: "0.0.0.0",
};

export function useVPN() {
  const [connection, setConnection] = useState<VPNConnection>(DEFAULT_CONNECTION);
  const [settings, setSettings] = useState<VPNSettings>(DEFAULT_SETTINGS);
  const [servers, setServers] = useState<VPNServer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Carregar dados do storage ao iniciar
  useEffect(() => {
    loadFromStorage();
  }, []);

  const loadFromStorage = useCallback(async () => {
    try {
      const [connectionData, settingsData, serversData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CONNECTION),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.SERVERS),
      ]);

      if (connectionData) {
        setConnection(JSON.parse(connectionData));
      }
      if (settingsData) {
        setSettings(JSON.parse(settingsData));
      }
      if (serversData) {
        setServers(JSON.parse(serversData));
      }
    } catch (err) {
      console.error("Erro ao carregar dados do storage:", err);
    }
  }, []);

  const saveConnection = useCallback(async (newConnection: VPNConnection) => {
    try {
      setConnection(newConnection);
      await AsyncStorage.setItem(STORAGE_KEYS.CONNECTION, JSON.stringify(newConnection));
    } catch (err) {
      console.error("Erro ao salvar conexão:", err);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: VPNSettings) => {
    try {
      setSettings(newSettings);
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
    }
  }, []);

  const connect = useCallback(
    async (server: VPNServer) => {
      setLoading(true);
      setError(undefined);
      try {
        // Simular conexão com delay
        await saveConnection({
          ...connection,
          status: "connecting",
          server,
          connectedAt: Date.now(),
        });

        // Simular delay de conexão (2-3 segundos)
        await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000));

        // Simular mudança de IP
        const newIP = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;

        await saveConnection({
          status: "connected",
          server,
          connectedAt: Date.now(),
          currentIP: newIP,
          protocol: settings.protocol,
          encryption: "AES-256",
          uploadSpeed: Math.floor(Math.random() * 50) + 10,
          downloadSpeed: Math.floor(Math.random() * 100) + 20,
        });

        // Atualizar servidor selecionado
        await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_SERVER, JSON.stringify(server));

        setLoading(false);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Erro ao conectar";
        setError(errorMsg);
        await saveConnection({
          ...connection,
          status: "error",
        });
        setLoading(false);
      }
    },
    [connection, settings.protocol, saveConnection]
  );

  const disconnect = useCallback(async () => {
    setLoading(true);
    try {
      // Simular desconexão
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await saveConnection({
        status: "disconnected",
        originalIP: connection.originalIP,
        currentIP: connection.originalIP,
      });

      setLoading(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao desconectar";
      setError(errorMsg);
      setLoading(false);
    }
  }, [connection.originalIP, saveConnection]);

  const toggleFavorite = useCallback(
    async (serverId: string) => {
      const newFavorites = settings.favoriteServers.includes(serverId)
        ? settings.favoriteServers.filter((id) => id !== serverId)
        : [...settings.favoriteServers, serverId];

      const newSettings = { ...settings, favoriteServers: newFavorites };
      await saveSettings(newSettings);

      // Atualizar lista de servidores com status de favorito
      const updatedServers = servers.map((s) => ({
        ...s,
        isFavorite: newFavorites.includes(s.id),
      }));
      setServers(updatedServers);
    },
    [settings, servers, saveSettings]
  );

  const updateSettings = useCallback(
    async (updates: Partial<VPNSettings>) => {
      const newSettings = { ...settings, ...updates };
      await saveSettings(newSettings);
    },
    [settings, saveSettings]
  );

  const fetchServers = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      // Buscar lista de servidores da API VPN Gate
      const response = await fetch("https://www.vpngate.net/api/iphone/");
      const text = await response.text();

      // Parsear CSV (ignorar linhas de comentário)
      const lines = text.split("\n").filter((line) => !line.startsWith("*") && line.trim());

      const parsedServers: VPNServer[] = lines
        .slice(1) // Pular cabeçalho
        .map((line, index) => {
          const parts = line.split(",");
          if (parts.length < 6) return null;

          const [hostname, ip, port, country, numSessions, uptime, totalUsers, totalTraffic] = parts;

          return {
            id: `${hostname}-${index}`,
            country: country || "Unknown",
            countryCode: country?.substring(0, 2).toUpperCase() || "XX",
            ip: ip || "",
            port: parseInt(port) || 1194,
            protocol: "openvpn" as const,
            ping: Math.floor(Math.random() * 100) + 10,
            load: Math.floor(Math.random() * 100),
            speed: Math.floor(Math.random() * 100) + 20,
            isFavorite: false,
          };
        })
        .filter((s) => s !== null) as VPNServer[];

      // Limitar a 50 servidores para performance
      setServers(parsedServers.slice(0, 50));
      await AsyncStorage.setItem(STORAGE_KEYS.SERVERS, JSON.stringify(parsedServers.slice(0, 50)));

      setLoading(false);
    } catch (err) {
      console.error("Erro ao buscar servidores:", err);
      // Se falhar, usar servidores de fallback
      const fallbackServers: VPNServer[] = [
        {
          id: "pt-1",
          country: "Portugal",
          countryCode: "PT",
          ip: "185.107.47.215",
          port: 1194,
          protocol: "openvpn",
          ping: 45,
          load: 30,
          speed: 85,
          isFavorite: false,
        },
        {
          id: "br-1",
          country: "Brazil",
          countryCode: "BR",
          ip: "177.54.144.119",
          port: 1194,
          protocol: "openvpn",
          ping: 120,
          load: 50,
          speed: 60,
          isFavorite: false,
        },
        {
          id: "us-1",
          country: "United States",
          countryCode: "US",
          ip: "104.21.45.67",
          port: 1194,
          protocol: "openvpn",
          ping: 150,
          load: 40,
          speed: 75,
          isFavorite: false,
        },
        {
          id: "jp-1",
          country: "Japan",
          countryCode: "JP",
          ip: "219.100.37.82",
          port: 1194,
          protocol: "openvpn",
          ping: 200,
          load: 60,
          speed: 50,
          isFavorite: false,
        },
        {
          id: "de-1",
          country: "Germany",
          countryCode: "DE",
          ip: "185.10.127.1",
          port: 1194,
          protocol: "openvpn",
          ping: 60,
          load: 35,
          speed: 90,
          isFavorite: false,
        },
      ];

      setServers(fallbackServers);
      await AsyncStorage.setItem(STORAGE_KEYS.SERVERS, JSON.stringify(fallbackServers));
      setError("Usando servidores padrão");
      setLoading(false);
    }
  }, []);

  return {
    connection,
    settings,
    servers,
    loading,
    error,
    connect,
    disconnect,
    toggleFavorite,
    updateSettings,
    fetchServers,
    loadFromStorage,
  };
}

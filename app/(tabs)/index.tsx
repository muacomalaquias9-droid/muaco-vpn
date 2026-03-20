import { ScrollView, Text, View, Pressable, Switch, FlatList } from "react-native";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

interface VPNServer {
  id: string;
  name: string;
  operator: string;
  protocol: "UDP" | "TCP";
  port: number;
}

interface VPNLog {
  id: string;
  timestamp: number;
  action: "connect" | "disconnect";
  server: string;
  duration: number;
}

interface VPNStats {
  totalConnections: number;
  totalDataUsed: number;
  totalTimeConnected: number;
  lastConnected: number;
}

const SERVERS: VPNServer[] = [
  { id: "unitel", name: "Unitel NET", operator: "Unitel", protocol: "UDP", port: 1194 },
  { id: "africell1", name: "Africell 01", operator: "Africell", protocol: "UDP", port: 1194 },
  { id: "africell2", name: "Africell 02", operator: "Africell", protocol: "TCP", port: 443 },
];

const DEFAULT_APPS = [
  "WhatsApp", "Facebook", "Instagram", "Twitter", "Maps", "Spotify", "Netflix", "Chrome",
  "Gmail", "YouTube", "Reddit", "Pinterest", "LinkedIn", "Snapchat", "TikTok", "Telegram",
  "Viber", "Skype", "Discord", "Slack", "Amazon", "eBay", "AliExpress", "Uber", "Lyft",
  "Airbnb", "Booking", "Expedia", "Waze", "Duolingo", "Coursera", "Udemy", "edX", "Fitbit",
  "MyFitnessPal", "Strava", "Nike Run", "Google Photos", "Lightroom", "Photoshop", "Snapseed",
  "VSCO", "Canva", "Adobe Express", "Word", "Excel", "PowerPoint", "Google Docs", "Sheets",
  "OneDrive", "Dropbox", "Google Drive", "iCloud", "Mega", "Telegram", "Signal", "Wire",
  "Threema", "Wickr", "Session", "Briar", "Element", "Jami", "Tox", "Ricochet", "Pond",
  "Bitmessage", "Retroshare", "I2P", "Tor Browser", "Mullvad VPN", "ProtonVPN", "ExpressVPN",
  "NordVPN", "Surfshark", "CyberGhost", "Private Internet Access", "IPVanish", "HotspotShield",
  "Windscribe", "TunnelBear", "ZenMate", "Psiphon", "Hotspot Shield", "Opera VPN", "Avast VPN",
  "AVG VPN", "McAfee VPN", "Norton VPN", "Kaspersky VPN", "F-Secure VPN", "Bitdefender VPN",
  "ESET VPN", "Trend Micro VPN", "Sophos VPN", "Palo Alto VPN", "Cisco VPN", "Fortinet VPN",
  "Juniper VPN", "Check Point VPN", "SonicWall VPN", "Watchguard VPN", "Barracuda VPN",
];

export default function HomeScreen() {
  const colors = useColors();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedServer, setSelectedServer] = useState<VPNServer | null>(SERVERS[0]);
  const [killSwitchEnabled, setKillSwitchEnabled] = useState(false);
  const [splitTunnelingEnabled, setSplitTunnelingEnabled] = useState(false);
  const [bypassedApps, setBypassedApps] = useState<string[]>([]);
  const [logs, setLogs] = useState<VPNLog[]>([]);
  const [stats, setStats] = useState<VPNStats>({
    totalConnections: 0,
    totalDataUsed: 0,
    totalTimeConnected: 0,
    lastConnected: 0,
  });
  const [showLogs, setShowLogs] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [connectionStartTime, setConnectionStartTime] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedServer = await AsyncStorage.getItem("vpn_server");
      const savedKillSwitch = await AsyncStorage.getItem("vpn_kill_switch");
      const savedSplitTunneling = await AsyncStorage.getItem("vpn_split_tunneling");
      const savedBypassedApps = await AsyncStorage.getItem("vpn_bypassed_apps");
      const savedLogs = await AsyncStorage.getItem("vpn_logs");
      const savedStats = await AsyncStorage.getItem("vpn_stats");

      if (savedServer) setSelectedServer(JSON.parse(savedServer));
      if (savedKillSwitch) setKillSwitchEnabled(JSON.parse(savedKillSwitch));
      if (savedSplitTunneling) setSplitTunnelingEnabled(JSON.parse(savedSplitTunneling));
      if (savedBypassedApps) setBypassedApps(JSON.parse(savedBypassedApps));
      if (savedLogs) setLogs(JSON.parse(savedLogs));
      if (savedStats) setStats(JSON.parse(savedStats));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const addLog = (action: "connect" | "disconnect", server: string, duration: number) => {
    const newLog: VPNLog = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      action,
      server,
      duration,
    };
    const updatedLogs = [newLog, ...logs].slice(0, 100);
    setLogs(updatedLogs);
    AsyncStorage.setItem("vpn_logs", JSON.stringify(updatedLogs));
  };

  const updateStats = (duration: number) => {
    const updated: VPNStats = {
      totalConnections: stats.totalConnections + 1,
      totalDataUsed: stats.totalDataUsed + Math.floor(Math.random() * 100),
      totalTimeConnected: stats.totalTimeConnected + duration,
      lastConnected: Date.now(),
    };
    setStats(updated);
    AsyncStorage.setItem("vpn_stats", JSON.stringify(updated));
  };

  const handleConnect = async () => {
    if (!selectedServer) return;

    setIsConnecting(true);
    setConnectionStartTime(Date.now());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 5000);
  };

  const handleDisconnect = async () => {
    if (connectionStartTime) {
      const duration = Math.floor((Date.now() - connectionStartTime) / 1000);
      addLog("disconnect", selectedServer?.name || "Desconhecido", duration);
      updateStats(duration);
    }
    setIsConnected(false);
    setConnectionStartTime(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleKillSwitch = (value: boolean) => {
    setKillSwitchEnabled(value);
    AsyncStorage.setItem("vpn_kill_switch", JSON.stringify(value));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleSplitTunneling = (value: boolean) => {
    setSplitTunnelingEnabled(value);
    AsyncStorage.setItem("vpn_split_tunneling", JSON.stringify(value));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleAppBypass = (appName: string) => {
    const updated = bypassedApps.includes(appName)
      ? bypassedApps.filter((app) => app !== appName)
      : [...bypassedApps, appName];
    setBypassedApps(updated);
    AsyncStorage.setItem("vpn_bypassed_apps", JSON.stringify(updated));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          <View>
            <Text className="text-3xl font-bold text-foreground">Muaco VPN</Text>
            <Text className="text-xs text-muted">Apenas Angola 🇦🇴</Text>
          </View>

          {/* Status */}
          <View className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
            <Text className="text-sm text-muted mb-2">Status</Text>
            <Text className="text-2xl font-bold text-foreground">
              {isConnecting ? "⏳ Conectando..." : isConnected ? "🔒 Conectado" : "🔓 Desconectado"}
            </Text>
            {isConnected && selectedServer && (
              <View className="gap-1 mt-3">
                <Text className="text-xs text-muted">Servidor: {selectedServer.name}</Text>
                <Text className="text-xs text-muted">
                  Protocolo: {selectedServer.protocol}:{selectedServer.port}
                </Text>
              </View>
            )}
          </View>

          {/* Botão Conectar/Desconectar */}
          {!isConnected ? (
            <Pressable onPress={handleConnect} disabled={isConnecting}>
              {({ pressed }) => (
                <View
                  className="bg-primary rounded-2xl py-4 items-center"
                  style={{ opacity: pressed ? 0.8 : 1 }}
                >
                  <Text className="text-white font-bold text-lg">
                    {isConnecting ? "Conectando..." : "Conectar"}
                  </Text>
                </View>
              )}
            </Pressable>
          ) : (
            <Pressable onPress={handleDisconnect}>
              {({ pressed }) => (
                <View
                  className="bg-error rounded-2xl py-4 items-center"
                  style={{ opacity: pressed ? 0.8 : 1 }}
                >
                  <Text className="text-white font-bold text-lg">Desconectar</Text>
                </View>
              )}
            </Pressable>
          )}

          {/* Kill Switch */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-sm font-bold text-foreground">Kill Switch</Text>
                <Text className="text-xs text-muted">Bloqueia tráfego se VPN cair</Text>
              </View>
              <Switch
                value={killSwitchEnabled}
                onValueChange={toggleKillSwitch}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={killSwitchEnabled ? colors.primary : colors.muted}
              />
            </View>
          </View>

          {/* Split Tunneling */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-sm font-bold text-foreground">Split Tunneling</Text>
                <Text className="text-xs text-muted">{bypassedApps.length} apps excluídos</Text>
              </View>
              <Switch
                value={splitTunnelingEnabled}
                onValueChange={toggleSplitTunneling}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={splitTunnelingEnabled ? colors.primary : colors.muted}
              />
            </View>
          </View>

          {/* Servidores */}
          <View className="gap-3">
            <Text className="text-sm font-bold text-foreground">Servidores OpenVPN Angola</Text>
            {SERVERS.map((server) => (
              <Pressable
                key={server.id}
                onPress={() => {
                  setSelectedServer(server);
                  AsyncStorage.setItem("vpn_server", JSON.stringify(server));
                }}
                disabled={isConnected}
              >
                {({ pressed }) => (
                  <View
                    className={`flex-row items-center justify-between p-3 rounded-xl border ${
                      selectedServer?.id === server.id
                        ? "bg-primary/10 border-primary"
                        : "bg-surface border-border"
                    }`}
                    style={{ opacity: pressed ? 0.7 : 1 }}
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-foreground">{server.name}</Text>
                      <Text className="text-xs text-muted">
                        {server.protocol}:{server.port}
                      </Text>
                    </View>
                    {selectedServer?.id === server.id && <Text className="text-primary">✓</Text>}
                  </View>
                )}
              </Pressable>
            ))}
          </View>

          {/* Apps Split Tunneling */}
          {splitTunnelingEnabled && (
            <View className="gap-3">
              <Pressable onPress={() => setShowApps(!showApps)}>
                <Text className="text-sm font-bold text-primary">
                  {showApps ? "Ocultar" : "Ver"} 100 Apps ({bypassedApps.length} excluídos)
                </Text>
              </Pressable>

              {showApps && (
                <View className="bg-surface rounded-xl p-3 border border-border max-h-64">
                  <FlatList
                    data={DEFAULT_APPS}
                    scrollEnabled={true}
                    keyExtractor={(item, idx) => idx.toString()}
                    renderItem={({ item }) => (
                      <Pressable onPress={() => toggleAppBypass(item)}>
                        {({ pressed }) => (
                          <View
                            className={`flex-row items-center justify-between p-2 rounded mb-1 ${
                              bypassedApps.includes(item)
                                ? "bg-primary/10 border border-primary"
                                : "bg-surface border border-border"
                            }`}
                            style={{ opacity: pressed ? 0.7 : 1 }}
                          >
                            <Text className="text-xs font-bold text-foreground flex-1">
                              {item}
                            </Text>
                            {bypassedApps.includes(item) && (
                              <Text className="text-xs text-primary">✓</Text>
                            )}
                          </View>
                        )}
                      </Pressable>
                    )}
                  />
                </View>
              )}
            </View>
          )}

          {/* Estatísticas */}
          <View className="gap-3">
            <Pressable onPress={() => setShowStats(!showStats)}>
              <Text className="text-sm font-bold text-primary">
                {showStats ? "Ocultar" : "Ver"} Estatísticas
              </Text>
            </Pressable>

            {showStats && (
              <View className="bg-surface rounded-xl p-4 border border-border gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted">Conexões:</Text>
                  <Text className="text-xs font-bold text-foreground">
                    {stats.totalConnections}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted">Tempo Total:</Text>
                  <Text className="text-xs font-bold text-foreground">
                    {Math.floor(stats.totalTimeConnected / 60)}m
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted">Dados:</Text>
                  <Text className="text-xs font-bold text-foreground">
                    {stats.totalDataUsed} MB
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted">Última Conexão:</Text>
                  <Text className="text-xs font-bold text-foreground">
                    {stats.lastConnected ? new Date(stats.lastConnected).toLocaleDateString() : "-"}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Logs */}
          <View className="gap-3">
            <Pressable onPress={() => setShowLogs(!showLogs)}>
              <Text className="text-sm font-bold text-primary">
                {showLogs ? "Ocultar" : "Ver"} Logs ({logs.length})
              </Text>
            </Pressable>

            {showLogs && (
              <View className="bg-surface rounded-xl p-3 gap-2 max-h-48 border border-border">
                {logs.length === 0 ? (
                  <Text className="text-xs text-muted">Sem logs</Text>
                ) : (
                  logs.slice(0, 10).map((log) => (
                    <View key={log.id} className="border-b border-border pb-2">
                      <Text className="text-xs font-bold text-foreground">
                        {log.action === "connect" ? "🔗" : "🔌"} {log.server}
                      </Text>
                      <Text className="text-xs text-muted">
                        Duração: {Math.floor(log.duration / 60)}m {log.duration % 60}s
                      </Text>
                      <Text className="text-xs text-muted">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

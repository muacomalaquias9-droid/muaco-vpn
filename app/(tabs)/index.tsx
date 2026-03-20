import { ScrollView, Text, View, Pressable, Image, Switch, FlatList } from "react-native";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import * as Permissions from "expo-permissions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

const OPERATOR_LOGOS: Record<string, any> = {};

interface VPNServer {
  id: string;
  name: string;
  operator: string;
  protocol: "UDP" | "TCP";
  port: number;
  host: string;
}

interface InstalledApp {
  packageName: string;
  appName: string;
  bypassVPN: boolean;
}

interface VPNLog {
  id: string;
  timestamp: number;
  action: "connect" | "disconnect";
  server: string;
  status: "success" | "failed";
  message: string;
}

const SERVERS: VPNServer[] = [
  {
    id: "unitel_net",
    name: "Unitel NET",
    operator: "Unitel",
    protocol: "UDP",
    port: 1194,
    host: "vpn.unitel.ao",
  },
  {
    id: "africell_01",
    name: "Africell 01",
    operator: "Africell",
    protocol: "UDP",
    port: 1194,
    host: "vpn1.africell.ao",
  },
  {
    id: "africell_02",
    name: "Africell 02",
    operator: "Africell",
    protocol: "TCP",
    port: 443,
    host: "vpn2.africell.ao",
  },
];

// 50 apps populares
const DEFAULT_APPS: InstalledApp[] = [
  { packageName: "com.whatsapp", appName: "WhatsApp", bypassVPN: false },
  { packageName: "com.facebook.katana", appName: "Facebook", bypassVPN: false },
  { packageName: "com.instagram.android", appName: "Instagram", bypassVPN: false },
  { packageName: "com.twitter.android", appName: "Twitter", bypassVPN: false },
  { packageName: "com.google.android.apps.maps", appName: "Google Maps", bypassVPN: false },
  { packageName: "com.spotify.music", appName: "Spotify", bypassVPN: false },
  { packageName: "com.netflix.mediaclient", appName: "Netflix", bypassVPN: false },
  { packageName: "com.android.chrome", appName: "Chrome", bypassVPN: false },
  { packageName: "com.google.android.gms", appName: "Google Play Services", bypassVPN: false },
  { packageName: "com.google.android.googlequicksearchbox", appName: "Google Search", bypassVPN: false },
  { packageName: "com.telegram.messenger", appName: "Telegram", bypassVPN: false },
  { packageName: "com.viber.voip", appName: "Viber", bypassVPN: false },
  { packageName: "com.skype.raider", appName: "Skype", bypassVPN: false },
  { packageName: "com.discord", appName: "Discord", bypassVPN: false },
  { packageName: "com.tiktok.android", appName: "TikTok", bypassVPN: false },
  { packageName: "com.youtube.android", appName: "YouTube", bypassVPN: false },
  { packageName: "com.reddit.frontpage", appName: "Reddit", bypassVPN: false },
  { packageName: "com.pinterest", appName: "Pinterest", bypassVPN: false },
  { packageName: "com.linkedin.android", appName: "LinkedIn", bypassVPN: false },
  { packageName: "com.snapchat.android", appName: "Snapchat", bypassVPN: false },
  { packageName: "com.amazon.venezia", appName: "Amazon Shopping", bypassVPN: false },
  { packageName: "com.ebay.mobile", appName: "eBay", bypassVPN: false },
  { packageName: "com.aliexpress.retail", appName: "AliExpress", bypassVPN: false },
  { packageName: "com.uber.client", appName: "Uber", bypassVPN: false },
  { packageName: "com.lyft.android", appName: "Lyft", bypassVPN: false },
  { packageName: "com.airbnb.android", appName: "Airbnb", bypassVPN: false },
  { packageName: "com.booking", appName: "Booking.com", bypassVPN: false },
  { packageName: "com.expedia.mobile", appName: "Expedia", bypassVPN: false },
  { packageName: "com.google.android.apps.maps", appName: "Google Maps", bypassVPN: false },
  { packageName: "com.waze", appName: "Waze", bypassVPN: false },
  { packageName: "com.duolingo", appName: "Duolingo", bypassVPN: false },
  { packageName: "com.coursera", appName: "Coursera", bypassVPN: false },
  { packageName: "com.udemy.android", appName: "Udemy", bypassVPN: false },
  { packageName: "com.edx.mobile", appName: "edX", bypassVPN: false },
  { packageName: "com.fitbit.FitbitMobile", appName: "Fitbit", bypassVPN: false },
  { packageName: "com.myfitnesspal.android", appName: "MyFitnessPal", bypassVPN: false },
  { packageName: "com.strava", appName: "Strava", bypassVPN: false },
  { packageName: "com.nike.plusgps", appName: "Nike Run Club", bypassVPN: false },
  { packageName: "com.google.android.apps.photos", appName: "Google Photos", bypassVPN: false },
  { packageName: "com.adobe.lightroom", appName: "Adobe Lightroom", bypassVPN: false },
  { packageName: "com.adobe.photoshop.touch", appName: "Adobe Photoshop", bypassVPN: false },
  { packageName: "com.snapseed", appName: "Snapseed", bypassVPN: false },
  { packageName: "com.vsco", appName: "VSCO", bypassVPN: false },
  { packageName: "com.canva.editor", appName: "Canva", bypassVPN: false },
  { packageName: "com.adobe.creativesuite.express", appName: "Adobe Express", bypassVPN: false },
  { packageName: "com.microsoft.office.word", appName: "Microsoft Word", bypassVPN: false },
  { packageName: "com.microsoft.office.excel", appName: "Microsoft Excel", bypassVPN: false },
  { packageName: "com.microsoft.office.powerpoint", appName: "Microsoft PowerPoint", bypassVPN: false },
  { packageName: "com.google.android.apps.docs", appName: "Google Docs", bypassVPN: false },
  { packageName: "com.google.android.apps.sheets", appName: "Google Sheets", bypassVPN: false },
];

export default function HomeScreen() {
  const colors = useColors();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedServer, setSelectedServer] = useState<VPNServer | null>(null);
  const [killSwitchEnabled, setKillSwitchEnabled] = useState(false);
  const [isKillSwitchActive, setIsKillSwitchActive] = useState(false);
  const [splitTunnelingEnabled, setSplitTunnelingEnabled] = useState(false);
  const [apps, setApps] = useState<InstalledApp[]>(DEFAULT_APPS);
  const [logs, setLogs] = useState<VPNLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    requestAllPermissions();
    loadSettings();
  }, []);

  const requestAllPermissions = async () => {
    try {
      const { status: vpnStatus } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      const { status: internetStatus } = await Permissions.askAsync(Permissions.CALENDAR);
      const { status: networkStatus } = await Permissions.askAsync(Permissions.CONTACTS);

      if (vpnStatus === "granted" && internetStatus === "granted" && networkStatus === "granted") {
        setPermissionsGranted(true);
        addLog("connect", "Sistema", "success", "✓ Todas as permissões concedidas");
      } else {
        addLog("connect", "Sistema", "failed", "✗ Permissões não concedidas");
      }
    } catch (error) {
      console.error("Erro ao solicitar permissões:", error);
      addLog("connect", "Sistema", "failed", `Erro ao solicitar permissões: ${error}`);
    }
  };

  const loadSettings = async () => {
    try {
      const savedServer = await AsyncStorage.getItem("vpn_server");
      const savedKillSwitch = await AsyncStorage.getItem("vpn_kill_switch");
      const savedSplitTunneling = await AsyncStorage.getItem("vpn_split_tunneling");
      const savedApps = await AsyncStorage.getItem("vpn_apps");
      const savedLogs = await AsyncStorage.getItem("vpn_logs");

      if (savedServer) setSelectedServer(JSON.parse(savedServer));
      if (savedKillSwitch) setKillSwitchEnabled(JSON.parse(savedKillSwitch));
      if (savedSplitTunneling) setSplitTunnelingEnabled(JSON.parse(savedSplitTunneling));
      if (savedApps) setApps(JSON.parse(savedApps));
      if (savedLogs) setLogs(JSON.parse(savedLogs));
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  const addLog = (action: "connect" | "disconnect", server: string, status: "success" | "failed", message: string) => {
    const newLog: VPNLog = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      action,
      server,
      status,
      message,
    };
    const updatedLogs = [newLog, ...logs].slice(0, 100);
    setLogs(updatedLogs);
    AsyncStorage.setItem("vpn_logs", JSON.stringify(updatedLogs));
  };

  const handleConnect = async () => {
    if (!selectedServer) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      addLog("connect", "Sistema", "failed", "Selecione um servidor primeiro");
      return;
    }

    if (!permissionsGranted) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      addLog("connect", "Sistema", "failed", "Permissões não concedidas");
      return;
    }

    setIsConnecting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simular conexão OpenVPN real (5 segundos)
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addLog("connect", selectedServer.name, "success", `Conectado via ${selectedServer.protocol}:${selectedServer.port}`);
      AsyncStorage.setItem("vpn_server", JSON.stringify(selectedServer));
    }, 5000);
  };

  const handleDisconnect = async () => {
    setIsConnected(false);
    setIsKillSwitchActive(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addLog("disconnect", selectedServer?.name || "Desconhecido", "success", "Desconectado");
  };

  const toggleKillSwitch = async (value: boolean) => {
    setKillSwitchEnabled(value);
    AsyncStorage.setItem("vpn_kill_switch", JSON.stringify(value));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addLog("connect", "Kill Switch", "success", value ? "Ativado" : "Desativado");
  };

  const toggleSplitTunneling = async (value: boolean) => {
    setSplitTunnelingEnabled(value);
    AsyncStorage.setItem("vpn_split_tunneling", JSON.stringify(value));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addLog("connect", "Split Tunneling", "success", value ? "Ativado" : "Desativado");
  };

  const toggleAppBypass = (packageName: string) => {
    const updated = apps.map((app) =>
      app.packageName === packageName ? { ...app, bypassVPN: !app.bypassVPN } : app
    );
    setApps(updated);
    AsyncStorage.setItem("vpn_apps", JSON.stringify(updated));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const bypassedAppsCount = apps.filter((app) => app.bypassVPN).length;

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
            <Text className="text-2xl font-bold text-foreground mb-4">
              {isConnecting ? "⏳ Conectando..." : isConnected ? "🔒 Conectado" : "🔓 Desconectado"}
            </Text>
            {isConnected && selectedServer && (
              <View className="gap-1">
                <Text className="text-xs text-muted">Servidor: {selectedServer.name}</Text>
                <Text className="text-xs text-muted">Protocolo: {selectedServer.protocol}:{selectedServer.port}</Text>
              </View>
            )}
            {isKillSwitchActive && (
              <View className="bg-error/20 rounded-lg p-2 mt-3 border border-error">
                <Text className="text-xs text-error font-bold">🛑 Kill Switch Ativo</Text>
              </View>
            )}
            {!permissionsGranted && (
              <View className="bg-warning/20 rounded-lg p-2 mt-3 border border-warning">
                <Text className="text-xs text-warning font-bold">⚠️ Permissões necessárias</Text>
              </View>
            )}
          </View>

          {/* Botão Conectar/Desconectar */}
          {!isConnected ? (
            <Pressable onPress={handleConnect} disabled={isConnecting || !permissionsGranted}>
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
                <Text className="text-xs text-muted">{bypassedAppsCount} apps excluídos</Text>
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
                    className={`flex-row items-center gap-3 p-3 rounded-xl border ${
                      selectedServer?.id === server.id
                        ? "bg-primary/10 border-primary"
                        : "bg-surface border-border"
                    }`}
                    style={{ opacity: pressed ? 0.7 : 1 }}
                  >
                    <View className="w-10 h-10 rounded bg-primary/20 items-center justify-center">
                      <Text className="text-xs font-bold text-primary">
                        {server.operator === "Unitel" ? "U" : "A"}
                      </Text>
                    </View>
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
                  {showApps ? "Ocultar Apps" : "Ver 50 Apps"} ({bypassedAppsCount} excluídos)
                </Text>
              </Pressable>

              {showApps && (
                <View className="bg-surface rounded-xl p-3 border border-border max-h-96">
                  <FlatList
                    data={apps}
                    scrollEnabled={false}
                    keyExtractor={(item) => item.packageName}
                    renderItem={({ item }) => (
                      <Pressable onPress={() => toggleAppBypass(item.packageName)}>
                        {({ pressed }) => (
                          <View
                            className={`flex-row items-center justify-between p-2 rounded border mb-1 ${
                              item.bypassVPN
                                ? "bg-primary/10 border-primary"
                                : "bg-surface border-border"
                            }`}
                            style={{ opacity: pressed ? 0.7 : 1 }}
                          >
                            <Text className="text-xs font-bold text-foreground flex-1">
                              {item.appName}
                            </Text>
                            {item.bypassVPN && <Text className="text-xs text-primary">✓</Text>}
                          </View>
                        )}
                      </Pressable>
                    )}
                  />
                </View>
              )}
            </View>
          )}

          {/* Logs */}
          <View className="gap-3">
            <Pressable onPress={() => setShowLogs(!showLogs)}>
              <Text className="text-sm font-bold text-primary">
                {showLogs ? "Ocultar Logs" : "Ver Logs"} ({logs.length})
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
                      <Text className="text-xs text-muted">{log.message}</Text>
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

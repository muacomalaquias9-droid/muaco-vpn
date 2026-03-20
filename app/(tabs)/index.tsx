import { ScrollView, Text, View, Pressable, Switch, FlatList, Modal, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useVPNPermission } from "@/hooks/use-vpn-permission";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useLocationPermission } from "@/hooks/use-location-permission";

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

interface InstalledApp {
  name: string;
  packageName: string;
}

const SERVERS: VPNServer[] = [
  { id: "unitel", name: "Unitel NET", operator: "Unitel", protocol: "UDP", port: 1194 },
  { id: "africell1", name: "Africell 01", operator: "Africell", protocol: "UDP", port: 1194 },
  { id: "africell2", name: "Africell 02", operator: "Africell", protocol: "TCP", port: 443 },
];

export default function HomeScreen() {
  const colors = useColors();
  const { vpnPermissionGranted, requestVPNPermission, isRequesting } = useVPNPermission();
  const { sendNotification } = usePushNotifications();
  const { locationPermissionGranted, requestLocationPermission, userLocation } = useLocationPermission();
  const [showPermissionModal, setShowPermissionModal] = useState(!vpnPermissionGranted);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedServer, setSelectedServer] = useState<VPNServer | null>(SERVERS[0]);
  const [killSwitchEnabled, setKillSwitchEnabled] = useState(false);
  const [splitTunnelingEnabled, setSplitTunnelingEnabled] = useState(false);
  const [bypassedApps, setBypassedApps] = useState<InstalledApp[]>([]);
  const [allApps, setAllApps] = useState<InstalledApp[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
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
  const [showLocationModal, setShowLocationModal] = useState(!locationPermissionGranted);

  useEffect(() => {
    loadData();
    loadInstalledApps();
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

  const loadInstalledApps = async () => {
    setLoadingApps(true);
    try {
      const mockApps: InstalledApp[] = [
        { name: "WhatsApp", packageName: "com.whatsapp" },
        { name: "Facebook", packageName: "com.facebook.katana" },
        { name: "Instagram", packageName: "com.instagram.android" },
        { name: "Twitter", packageName: "com.twitter.android" },
        { name: "Maps", packageName: "com.google.android.apps.maps" },
        { name: "Spotify", packageName: "com.spotify.music" },
        { name: "Netflix", packageName: "com.netflix.mediaclient" },
        { name: "Chrome", packageName: "com.android.chrome" },
        { name: "Gmail", packageName: "com.google.android.gm" },
        { name: "YouTube", packageName: "com.google.android.youtube" },
        { name: "Reddit", packageName: "com.reddit.frontpage" },
        { name: "Pinterest", packageName: "com.pinterest" },
        { name: "LinkedIn", packageName: "com.linkedin.android" },
        { name: "Snapchat", packageName: "com.snapchat.android" },
        { name: "TikTok", packageName: "com.ss.android.ugc.trill" },
        { name: "Telegram", packageName: "org.telegram.messenger" },
        { name: "Viber", packageName: "com.viber.voip" },
        { name: "Skype", packageName: "com.skype.raider" },
        { name: "Discord", packageName: "com.discord" },
        { name: "Slack", packageName: "com.slack" },
        { name: "Amazon", packageName: "com.amazon.mShop.android.shopping" },
        { name: "eBay", packageName: "com.ebay.mobile" },
        { name: "AliExpress", packageName: "com.alibaba.aliexpresshd" },
        { name: "Uber", packageName: "com.ubercab" },
        { name: "Lyft", packageName: "com.lyft.android" },
        { name: "Airbnb", packageName: "com.airbnb.android" },
        { name: "Booking", packageName: "com.booking" },
        { name: "Expedia", packageName: "com.expedia.bookings" },
        { name: "Waze", packageName: "com.waze" },
        { name: "Duolingo", packageName: "com.duolingo.android" },
        { name: "Coursera", packageName: "org.coursera.android" },
        { name: "Udemy", packageName: "com.udemy.android" },
        { name: "edX", packageName: "org.edx.mobile" },
        { name: "Fitbit", packageName: "com.fitbit.FitbitMobile" },
        { name: "MyFitnessPal", packageName: "com.myfitnesspal.android" },
        { name: "Strava", packageName: "com.strava" },
        { name: "Nike Run", packageName: "com.nike.plusgps" },
        { name: "Google Photos", packageName: "com.google.android.apps.photos" },
        { name: "Lightroom", packageName: "com.adobe.lrmobile" },
        { name: "Photoshop", packageName: "com.adobe.photoshop.touch" },
        { name: "Snapseed", packageName: "com.niksoftware.snapseed" },
        { name: "VSCO", packageName: "com.vsco.cam" },
        { name: "Canva", packageName: "com.canva.editor" },
        { name: "Adobe Express", packageName: "com.adobe.creativeapps.express" },
        { name: "Word", packageName: "com.microsoft.office.word" },
        { name: "Excel", packageName: "com.microsoft.office.excel" },
        { name: "PowerPoint", packageName: "com.microsoft.office.powerpoint" },
        { name: "Google Docs", packageName: "com.google.android.apps.docs" },
        { name: "Google Sheets", packageName: "com.google.android.apps.docs.editors.sheets" },
        { name: "OneDrive", packageName: "com.microsoft.skydrive" },
        { name: "Dropbox", packageName: "com.dropbox.android" },
        { name: "Google Drive", packageName: "com.google.android.apps.docs.editors.sheets" },
        { name: "iCloud", packageName: "com.apple.iCloud" },
        { name: "Mega", packageName: "mega.privacy.android.app" },
        { name: "Signal", packageName: "org.thoughtcrime.securesms" },
        { name: "Wire", packageName: "com.wire" },
        { name: "Threema", packageName: "ch.threema.app" },
        { name: "Wickr", packageName: "com.wickr.pro" },
        { name: "Session", packageName: "network.loki.messenger" },
        { name: "Briar", packageName: "org.briarproject.briar.android" },
        { name: "Element", packageName: "im.vector.app" },
        { name: "Jami", packageName: "cx.ring" },
        { name: "Tox", packageName: "im.gultom.tox" },
        { name: "Ricochet", packageName: "com.ricochet.im" },
        { name: "Pond", packageName: "im.ricochet.pond" },
        { name: "Bitmessage", packageName: "org.bitmessage.android" },
        { name: "Retroshare", packageName: "retroshare.android.gui" },
        { name: "I2P", packageName: "net.i2p.android" },
        { name: "Tor Browser", packageName: "org.torproject.torbrowser" },
        { name: "Mullvad VPN", packageName: "net.mullvad.mullvadvpn" },
        { name: "ProtonVPN", packageName: "com.protonvpn.android" },
        { name: "ExpressVPN", packageName: "com.expressvpn.vpn" },
        { name: "NordVPN", packageName: "com.nordvpn.android" },
        { name: "Surfshark", packageName: "com.surfshark.vpnclient.android" },
        { name: "CyberGhost", packageName: "de.mobilenetworking.cyberghost" },
        { name: "PIA", packageName: "com.privateinternetaccess.android" },
        { name: "IPVanish", packageName: "com.ipvanish.android.vpn" },
        { name: "HotspotShield", packageName: "hotspotshield.android.vpn" },
        { name: "Windscribe", packageName: "com.windscribe.vpn" },
        { name: "TunnelBear", packageName: "com.tunnelbear.android" },
        { name: "ZenMate", packageName: "com.zenmate.android" },
        { name: "Psiphon", packageName: "com.psiphon3" },
        { name: "Opera VPN", packageName: "com.opera.max" },
        { name: "Avast VPN", packageName: "com.avast.android.vpn" },
        { name: "AVG VPN", packageName: "com.avg.android.vpn" },
        { name: "McAfee VPN", packageName: "com.mcafee.android.vpn" },
        { name: "Norton VPN", packageName: "com.symantec.mobilesecurity" },
        { name: "Kaspersky VPN", packageName: "com.kaspersky.android.vpn" },
        { name: "F-Secure VPN", packageName: "com.fsecure.android.vpn" },
        { name: "Bitdefender VPN", packageName: "com.bitdefender.vpn" },
        { name: "ESET VPN", packageName: "com.eset.android.vpn" },
        { name: "Trend Micro VPN", packageName: "com.trendmicro.android.vpn" },
        { name: "Sophos VPN", packageName: "com.sophos.android.vpn" },
        { name: "Palo Alto VPN", packageName: "com.paloaltonetworks.android.vpn" },
        { name: "Cisco VPN", packageName: "com.cisco.android.vpn" },
        { name: "Fortinet VPN", packageName: "com.fortinet.android.vpn" },
        { name: "Juniper VPN", packageName: "com.juniper.android.vpn" },
        { name: "Check Point VPN", packageName: "com.checkpoint.android.vpn" },
        { name: "SonicWall VPN", packageName: "com.sonicwall.android.vpn" },
        { name: "Watchguard VPN", packageName: "com.watchguard.android.vpn" },
        { name: "Barracuda VPN", packageName: "com.barracuda.android.vpn" },
      ];

      setAllApps(mockApps);
    } catch (error) {
      console.error("Erro ao carregar apps:", error);
      setAllApps([]);
    } finally {
      setLoadingApps(false);
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

    if (!vpnPermissionGranted) {
      setShowPermissionModal(true);
      return;
    }

    setIsConnecting(true);
    setConnectionStartTime(Date.now());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      sendNotification("🔒 VPN Conectada", `Conectado a ${selectedServer?.name}`);
      addLog("connect", selectedServer?.name || "Desconhecido", 0);
    }, 5000);
  };

  const handleDisconnect = async () => {
    if (connectionStartTime) {
      const duration = Math.floor((Date.now() - connectionStartTime) / 1000);
      addLog("disconnect", selectedServer?.name || "Desconhecido", duration);
      updateStats(duration);
      sendNotification("🔓 VPN Desconectada", `Desconectado após ${Math.floor(duration / 60)}m`);
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

  const toggleAppBypass = (app: InstalledApp) => {
    const isAlreadyBypassed = bypassedApps.some((a) => a.packageName === app.packageName);
    const updated = isAlreadyBypassed
      ? bypassedApps.filter((a) => a.packageName !== app.packageName)
      : [...bypassedApps, app];
    setBypassedApps(updated);
    AsyncStorage.setItem("vpn_bypassed_apps", JSON.stringify(updated));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScreenContainer className="p-4">
      {/* Modal de Permissão de Localização */}
      <Modal visible={showLocationModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-surface rounded-3xl p-6 gap-4 w-full max-w-sm border border-border">
            <View className="items-center mb-2">
              <Text className="text-4xl mb-2">📍</Text>
              <Text className="text-2xl font-bold text-foreground text-center">Localização</Text>
            </View>
            <Text className="text-sm text-muted leading-relaxed text-center">
              Muaco VPN usa sua localização para melhorar a conexão e sugerir servidores mais próximos.
            </Text>

            <View className="gap-3">
              <Pressable
                onPress={async () => {
                  await requestLocationPermission();
                  setShowLocationModal(false);
                }}
              >
                {({ pressed }) => (
                  <View
                    className="bg-primary rounded-2xl py-4 items-center"
                    style={{ opacity: pressed ? 0.8 : 1 }}
                  >
                    <Text className="text-white font-bold text-lg">Permitir</Text>
                  </View>
                )}
              </Pressable>

              <Pressable onPress={() => setShowLocationModal(false)}>
                {({ pressed }) => (
                  <View
                    className="border border-border rounded-2xl py-4 items-center"
                    style={{ opacity: pressed ? 0.7 : 1 }}
                  >
                    <Text className="text-foreground font-bold">Depois</Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Permissão VPN */}
      <Modal visible={showPermissionModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-surface rounded-3xl p-6 gap-4 w-full max-w-sm border border-border">
            <View className="items-center mb-2">
              <Text className="text-4xl mb-2">🔐</Text>
              <Text className="text-2xl font-bold text-foreground text-center">Permissão VPN</Text>
            </View>
            <Text className="text-sm text-muted leading-relaxed text-center">
              Muaco VPN precisa de permissão para gerenciar a conexão VPN do seu dispositivo.
            </Text>

            <View className="gap-3">
              <Pressable
                onPress={async () => {
                  await requestVPNPermission();
                  setShowPermissionModal(false);
                }}
                disabled={isRequesting}
              >
                {({ pressed }) => (
                  <View
                    className="bg-primary rounded-2xl py-4 items-center"
                    style={{ opacity: pressed ? 0.8 : 1 }}
                  >
                    <Text className="text-white font-bold text-lg">
                      {isRequesting ? "Solicitando..." : "Conceder"}
                    </Text>
                  </View>
                )}
              </Pressable>

              <Pressable onPress={() => setShowPermissionModal(false)}>
                {({ pressed }) => (
                  <View
                    className="border border-border rounded-2xl py-4 items-center"
                    style={{ opacity: pressed ? 0.7 : 1 }}
                  >
                    <Text className="text-foreground font-bold">Depois</Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-6">
          {/* Header */}
          <View className="gap-1">
            <Text className="text-4xl font-bold text-foreground">Muaco VPN</Text>
            <Text className="text-sm text-primary font-semibold">Apenas Angola 🇦🇴</Text>
            {userLocation && (
              <Text className="text-xs text-muted">
                📍 {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
              </Text>
            )}
          </View>

          {/* Avisos de Permissão */}
          {!vpnPermissionGranted && (
            <View className="bg-warning/10 rounded-2xl p-4 border border-warning gap-2">
              <Text className="text-sm font-bold text-warning">⚠️ Permissão VPN Necessária</Text>
              <Text className="text-xs text-muted">Clique em Conectar para solicitar.</Text>
            </View>
          )}
          {!locationPermissionGranted && (
            <View className="bg-primary/10 rounded-2xl p-4 border border-primary/30 gap-2">
              <Text className="text-sm font-bold text-primary">📍 Localização Desativada</Text>
              <Text className="text-xs text-muted">Ative para melhorar a VPN.</Text>
            </View>
          )}

          {/* Status Card - Novo Design */}
          <View className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-6 border border-primary/30">
            <Text className="text-xs text-muted mb-2 font-semibold">STATUS DA CONEXÃO</Text>
            <Text className="text-3xl font-bold text-foreground mb-4">
              {isConnecting ? "⏳ Conectando..." : isConnected ? "🔒 VPN Ligada" : "🔓 Desconectado"}
            </Text>
            {isConnected && selectedServer && (
              <View className="gap-2 pt-4 border-t border-primary/20">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted">Servidor:</Text>
                  <Text className="text-xs font-bold text-foreground">{selectedServer.name}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted">Protocolo:</Text>
                  <Text className="text-xs font-bold text-foreground">
                    {selectedServer.protocol}:{selectedServer.port}
                  </Text>
                </View>
                <Text className="text-xs text-success mt-2 font-bold">✓ VPN Ativa no Dispositivo</Text>
              </View>
            )}
          </View>

          {/* Botão Conectar/Desconectar - Grande */}
          {!isConnected ? (
            <Pressable onPress={handleConnect} disabled={isConnecting}>
              {({ pressed }) => (
                <View
                  className="bg-primary rounded-3xl py-5 items-center active:scale-95"
                  style={{ opacity: pressed ? 0.8 : 1 }}
                >
                  <Text className="text-white font-bold text-xl">
                    {isConnecting ? "Conectando..." : "Conectar"}
                  </Text>
                </View>
              )}
            </Pressable>
          ) : (
            <Pressable onPress={handleDisconnect}>
              {({ pressed }) => (
                <View
                  className="bg-error rounded-3xl py-5 items-center active:scale-95"
                  style={{ opacity: pressed ? 0.8 : 1 }}
                >
                  <Text className="text-white font-bold text-xl">Desconectar</Text>
                </View>
              )}
            </Pressable>
          )}

          {/* Kill Switch */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-sm font-bold text-foreground">🛡️ Kill Switch</Text>
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
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-sm font-bold text-foreground">🔀 Split Tunneling</Text>
                <Text className="text-xs text-muted">{bypassedApps.length} apps excluídos</Text>
              </View>
              <Switch
                value={splitTunnelingEnabled}
                onValueChange={toggleSplitTunneling}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={splitTunnelingEnabled ? colors.primary : colors.muted}
              />
            </View>

            {splitTunnelingEnabled && (
              <Pressable onPress={() => setShowApps(!showApps)}>
                <Text className="text-sm font-bold text-primary">
                  {showApps ? "Ocultar" : "Gerenciar"} {allApps.length} Apps
                </Text>
              </Pressable>
            )}

            {showApps && splitTunnelingEnabled && (
              <View className="bg-surface rounded-xl p-3 border border-border max-h-64 mt-3">
                {loadingApps ? (
                  <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                  <FlatList
                    data={allApps}
                    scrollEnabled={true}
                    keyExtractor={(item) => item.packageName}
                    renderItem={({ item }) => {
                      const isBypassed = bypassedApps.some((a) => a.packageName === item.packageName);
                      return (
                        <Pressable onPress={() => toggleAppBypass(item)}>
                          {({ pressed }) => (
                            <View
                              className={`flex-row items-center justify-between p-2 rounded mb-1 ${
                                isBypassed
                                  ? "bg-primary/10 border border-primary"
                                  : "bg-surface border border-border"
                              }`}
                              style={{ opacity: pressed ? 0.7 : 1 }}
                            >
                              <Text className="text-xs font-bold text-foreground flex-1">
                                {item.name}
                              </Text>
                              {isBypassed && <Text className="text-xs text-primary">✓</Text>}
                            </View>
                          )}
                        </Pressable>
                      );
                    }}
                  />
                )}
              </View>
            )}
          </View>

          {/* Servidores */}
          <View className="gap-3">
            <Text className="text-sm font-bold text-foreground">🌍 Servidores OpenVPN Angola</Text>
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
                    className={`flex-row items-center justify-between p-4 rounded-2xl border ${
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
                    {selectedServer?.id === server.id && (
                      <Text className="text-primary font-bold">✓</Text>
                    )}
                  </View>
                )}
              </Pressable>
            ))}
          </View>

          {/* Estatísticas */}
          <View className="gap-3">
            <Pressable onPress={() => setShowStats(!showStats)}>
              <Text className="text-sm font-bold text-primary">
                {showStats ? "Ocultar" : "Ver"} 📊 Estatísticas
              </Text>
            </Pressable>

            {showStats && (
              <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
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
              </View>
            )}
          </View>

          {/* Logs */}
          <View className="gap-3">
            <Pressable onPress={() => setShowLogs(!showLogs)}>
              <Text className="text-sm font-bold text-primary">
                {showLogs ? "Ocultar" : "Ver"} 📋 Logs ({logs.length})
              </Text>
            </Pressable>

            {showLogs && (
              <View className="bg-surface rounded-2xl p-3 gap-2 max-h-48 border border-border">
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

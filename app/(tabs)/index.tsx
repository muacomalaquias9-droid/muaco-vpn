import { ScrollView, Text, View, Pressable, Image } from "react-native";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { VPNPermissionModal } from "@/components/vpn-permission-modal";
import { useColors } from "@/hooks/use-colors";
import { useOpenVPNReal, OPENVPN_CONFIGS, type OpenVPNConfig } from "@/hooks/use-openvpn-real";
import { VPNLogger, type VPNLog } from "@/lib/vpn-logger";

const OPERATOR_LOGOS: Record<string, any> = {
  Unitel: require("@/assets/images/unitel-logo.png"),
  Africell: require("@/assets/images/africell-logo.png"),
};

export default function HomeScreen() {
  const colors = useColors();
  const { isConnected, isConnecting, selectedConfig, error, connect, disconnect } =
    useOpenVPNReal();
  const [logs, setLogs] = useState<VPNLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [showPermission, setShowPermission] = useState(false);
  const [pendingConfig, setPendingConfig] = useState<OpenVPNConfig | null>(null);

  const servers = Object.values(OPENVPN_CONFIGS);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    if (isConnected || isConnecting) {
      loadLogs();
    }
  }, [isConnected, isConnecting]);

  const loadLogs = async () => {
    const allLogs = await VPNLogger.getLogs();
    setLogs(allLogs);
  };

  const handleConnectPress = (config: OpenVPNConfig) => {
    if (isConnected) return;
    setPendingConfig(config);
    setShowPermission(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePermissionAllow = async () => {
    if (!pendingConfig) return;
    setShowPermission(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await connect(pendingConfig);
    await loadLogs();
  };

  const handlePermissionDeny = () => {
    setShowPermission(false);
    setPendingConfig(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const handleDisconnect = async () => {
    await disconnect();
    await loadLogs();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
            <Text className="text-2xl font-bold text-foreground mb-4">
              {isConnecting ? "⏳ Conectando..." : isConnected ? "🔒 Conectado" : "🔓 Desconectado"}
            </Text>
            {isConnected && selectedConfig && (
              <View className="gap-1">
                <Text className="text-xs text-muted">Servidor: {selectedConfig.serverName}</Text>
                <Text className="text-xs text-muted">Operador: {selectedConfig.operator}</Text>
                <Text className="text-xs text-muted">
                  Protocolo: {selectedConfig.protocol.toUpperCase()}:{selectedConfig.port}
                </Text>
                <Text className="text-xs text-muted">
                  DNS: {selectedConfig.dnsServers.join(", ")}
                </Text>
              </View>
            )}
            {error && <Text className="text-xs text-error mt-2">Erro: {error}</Text>}
          </View>

          {/* Botão Desconectar */}
          {isConnected && (
            <Pressable onPress={handleDisconnect} disabled={isConnecting}>
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

          {/* Servidores */}
          <View className="gap-3">
            <Text className="text-sm font-bold text-foreground">Servidores OpenVPN Angola</Text>
            {servers.map((config) => (
              <Pressable
                key={config.serverId}
                onPress={() => handleConnectPress(config)}
                disabled={isConnected || isConnecting}
              >
                {({ pressed }) => (
                  <View
                    className={`flex-row items-center gap-3 p-3 rounded-xl border ${
                      selectedConfig?.serverId === config.serverId
                        ? "bg-primary/10 border-primary"
                        : "bg-surface border-border"
                    }`}
                    style={{ opacity: pressed ? 0.7 : 1 }}
                  >
                    <Image
                      source={OPERATOR_LOGOS[config.operator]}
                      style={{ width: 40, height: 40, borderRadius: 8 }}
                    />
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-foreground">{config.serverName}</Text>
                      <Text className="text-xs text-muted">
                        {config.protocol.toUpperCase()}:{config.port}
                      </Text>
                    </View>
                    {selectedConfig?.serverId === config.serverId && (
                      <Text className="text-primary">✓</Text>
                    )}
                  </View>
                )}
              </Pressable>
            ))}
          </View>

          {/* Logs */}
          <View className="gap-3">
            <Pressable onPress={() => setShowLogs(!showLogs)}>
              <Text className="text-sm font-bold text-primary">
                {showLogs ? "Ocultar Logs" : "Ver Logs"} ({logs.length})
              </Text>
            </Pressable>

            {showLogs && (
              <View className="bg-surface rounded-xl p-3 gap-2 max-h-48">
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
                        {VPNLogger.formatTime(log.timestamp)}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal de Permissão */}
      <VPNPermissionModal
        visible={showPermission}
        serverName={pendingConfig?.serverName || ""}
        onAllow={handlePermissionAllow}
        onDeny={handlePermissionDeny}
      />
    </ScreenContainer>
  );
}

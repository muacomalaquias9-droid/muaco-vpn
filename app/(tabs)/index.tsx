import { ScrollView, Text, View, Pressable, Image } from "react-native";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useVPNManager, type Server } from "@/hooks/use-vpn-manager";
import { VPNLogger, type VPNLog } from "@/lib/vpn-logger";

const SERVERS: Server[] = [
  { id: 1, name: "Unitel NET", operator: "Unitel", protocol: "OpenVPN", port: 1194 },
  { id: 2, name: "Africell 01", operator: "Africell", protocol: "OpenVPN", port: 1194 },
  { id: 3, name: "Africell 02", operator: "Africell", protocol: "OpenVPN", port: 443 },
];

const OPERATOR_LOGOS: Record<string, any> = {
  Unitel: require("@/assets/images/unitel-logo.png"),
  Africell: require("@/assets/images/africell-logo.png"),
};

export default function HomeScreen() {
  const colors = useColors();
  const { isConnected, isConnecting, selectedServer, connect, disconnect } = useVPNManager();
  const [logs, setLogs] = useState<VPNLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

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

  const handleConnect = async () => {
    if (!selectedServer) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    await connect(selectedServer);
    await loadLogs();
  };

  const handleDisconnect = async () => {
    await disconnect();
    await loadLogs();
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          <Text className="text-3xl font-bold text-foreground">Muaco VPN</Text>
          <Text className="text-xs text-muted">Apenas Angola 🇦🇴</Text>

          {/* Status */}
          <View className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
            <Text className="text-sm text-muted mb-2">Status</Text>
            <Text className="text-2xl font-bold text-foreground mb-4">
              {isConnecting ? "⏳ Conectando..." : isConnected ? "🔒 Conectado" : "🔓 Desconectado"}
            </Text>
            {isConnected && selectedServer && (
              <View className="gap-1">
                <Text className="text-xs text-muted">Servidor: {selectedServer.name}</Text>
                <Text className="text-xs text-muted">Operador: {selectedServer.operator}</Text>
                <Text className="text-xs text-muted">Protocolo: {selectedServer.protocol}</Text>
              </View>
            )}
          </View>

          {/* Botão */}
          <Pressable
            onPress={isConnected ? handleDisconnect : handleConnect}
            disabled={isConnecting || !selectedServer}
          >
            {({ pressed }) => (
              <View
                className="bg-primary rounded-2xl py-4 items-center"
                style={{ opacity: pressed ? 0.8 : 1 }}
              >
                <Text className="text-white font-bold text-lg">
                  {isConnecting ? "Processando..." : isConnected ? "Desconectar" : "Conectar"}
                </Text>
              </View>
            )}
          </Pressable>

          {/* Servidores */}
          <View className="gap-3">
            <Text className="text-sm font-bold text-foreground">Servidores Angola</Text>
            {SERVERS.map((server) => (
              <Pressable
                key={server.id}
                onPress={() => {
                  if (!isConnected) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
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
                    <Image
                      source={OPERATOR_LOGOS[server.operator]}
                      style={{ width: 40, height: 40, borderRadius: 8 }}
                    />
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-foreground">{server.name}</Text>
                      <Text className="text-xs text-muted">{server.operator}</Text>
                    </View>
                    {selectedServer?.id === server.id && <Text className="text-primary">✓</Text>}
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
    </ScreenContainer>
  );
}

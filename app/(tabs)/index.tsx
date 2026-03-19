import { ScrollView, Text, View, Pressable, Image } from "react-native";
import { useEffect, useState } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useOpenVPN } from "@/hooks/use-openvpn";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";
import { ANGOLA_VPN_SERVERS } from "@/lib/vpn-servers";
import { VPNLogger } from "@/lib/vpn-logger";

export default function HomeScreen() {
  const colors = useColors();
  const { connection, loading, connect, disconnect } = useOpenVPN();
  const [selectedServer, setSelectedServer] = useState(ANGOLA_VPN_SERVERS[0]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Carregar logs ao iniciar
  useEffect(() => {
    loadLogs();
    loadStats();
  }, []);

  // Atualizar logs quando conexão muda
  useEffect(() => {
    loadLogs();
    loadStats();
  }, [connection.status]);

  const loadLogs = async () => {
    const logs = await VPNLogger.getRecentLogs(5);
    setRecentLogs(logs);
  };

  const loadStats = async () => {
    const stats = await VPNLogger.getConnectionStats();
    setStats(stats);
  };

  const handleToggleVPN = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (connection.status === "connected") {
        await disconnect();
      } else if (connection.status === "disconnected") {
        if (!selectedServer) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return;
        }
        await connect(selectedServer);
      }
    } catch (error) {
      console.error("Erro ao alternar VPN:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const getStatusColor = () => {
    switch (connection.status) {
      case "connected":
        return colors.success;
      case "connecting":
        return colors.warning;
      case "error":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  const getStatusText = () => {
    switch (connection.status) {
      case "connected":
        return "Conectado";
      case "connecting":
        return "Conectando...";
      case "disconnecting":
        return "Desconectando...";
      case "error":
        return "Erro";
      default:
        return "Desconectado";
    }
  };

  const getStatusEmoji = () => {
    switch (connection.status) {
      case "connected":
        return "🔒";
      case "connecting":
        return "⏳";
      case "error":
        return "❌";
      default:
        return "🔓";
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-8">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Muaco VPN</Text>
            <Text className="text-sm text-muted">Proteção segura para seus dados</Text>
          </View>

          {/* Status Card */}
          <View className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
            <View className="gap-4">
              {/* Status Indicator */}
              <View className="items-center gap-3">
                <Text className="text-5xl">{getStatusEmoji()}</Text>
                <Text className={cn("text-xl font-bold", `text-[${getStatusColor()}]`)}>
                  {getStatusText()}
                </Text>
              </View>

              {/* Server Info */}
              {connection.server && (
                <View className="gap-3 border-t border-primary/20 pt-4">
                  <View className="flex-row items-center gap-3">
                    {connection.server.icon && (
                      <Image
                        source={{ uri: connection.server.icon }}
                        className="w-10 h-10 rounded"
                      />
                    )}
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">
                        {connection.server.name}
                      </Text>
                      <Text className="text-xs text-muted">{connection.server.operator}</Text>
                    </View>
                  </View>

                  {/* IP Addresses */}
                  {connection.currentIP && (
                    <View className="gap-2">
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">IP Privado:</Text>
                        <Text className="text-xs font-mono text-foreground">
                          {connection.originalIP}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">IP Público:</Text>
                        <Text className="text-xs font-mono text-foreground">
                          {connection.currentIP}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Speed */}
                  {connection.uploadSpeed && connection.downloadSpeed && (
                    <View className="gap-2 pt-2">
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">Download:</Text>
                        <Text className="text-xs font-semibold text-foreground">
                          {connection.downloadSpeed} Mbps
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">Upload:</Text>
                        <Text className="text-xs font-semibold text-foreground">
                          {connection.uploadSpeed} Mbps
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Connection Time */}
                  {connection.connectedAt && (
                    <View className="flex-row justify-between pt-2">
                      <Text className="text-xs text-muted">Conectado há:</Text>
                      <Text className="text-xs font-semibold text-foreground">
                        {Math.floor((Date.now() - connection.connectedAt) / 1000)}s
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Toggle Button */}
          <Pressable
            onPress={handleToggleVPN}
            disabled={loading}
            className="flex-1"
          >
            {({ pressed }) => (
              <View
                className={cn(
                  "bg-primary rounded-2xl py-4 items-center justify-center",
                  pressed && "opacity-80",
                  loading && "opacity-50"
                )}
              >
                <Text className="text-white text-lg font-bold">
                  {loading
                    ? "Processando..."
                    : connection.status === "connected"
                      ? "Desconectar"
                      : "Conectar"}
                </Text>
              </View>
            )}
          </Pressable>

          {/* Server Selection */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Selecionar Servidor</Text>
            <View className="gap-2">
              {ANGOLA_VPN_SERVERS.map((server) => (
                <Pressable
                  key={server.id}
                  onPress={() => {
                    setSelectedServer(server);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  disabled={connection.status === "connecting" || connection.status === "disconnecting"}
                >
                  {({ pressed }) => (
                    <View
                      className={cn(
                        "flex-row items-center gap-3 p-3 rounded-xl border-2",
                        selectedServer?.id === server.id
                          ? "bg-primary/10 border-primary"
                          : "bg-surface border-border",
                        pressed && "opacity-70"
                      )}
                    >
                      {server.icon && (
                        <Image
                          source={{ uri: server.icon }}
                          className="w-8 h-8 rounded"
                        />
                      )}
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">
                          {server.name}
                        </Text>
                        <Text className="text-xs text-muted">
                          {server.protocol.toUpperCase()} • Porta {server.port}
                        </Text>
                      </View>
                      {selectedServer?.id === server.id && (
                        <Text className="text-lg">✓</Text>
                      )}
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Statistics */}
          {stats && (
            <View className="bg-surface rounded-xl p-4 gap-2">
              <Text className="text-sm font-semibold text-foreground">Estatísticas</Text>
              <View className="flex-row justify-between">
                <Text className="text-xs text-muted">Total de Conexões:</Text>
                <Text className="text-xs font-semibold text-foreground">
                  {stats.totalConnections}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-muted">Bem-sucedidas:</Text>
                <Text className="text-xs font-semibold text-success">
                  {stats.successfulConnections}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-muted">Falhadas:</Text>
                <Text className="text-xs font-semibold text-error">
                  {stats.failedConnections}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-muted">Tempo Médio:</Text>
                <Text className="text-xs font-semibold text-foreground">
                  {stats.averageConnectionTime}ms
                </Text>
              </View>
            </View>
          )}

          {/* Recent Logs */}
          {recentLogs.length > 0 && (
            <View className="bg-surface rounded-xl p-4 gap-2">
              <Text className="text-sm font-semibold text-foreground">Logs Recentes</Text>
              <View className="gap-2">
                {recentLogs.map((log) => (
                  <View key={log.id} className="border-l-2 border-primary/30 pl-3 py-1">
                    <Text className="text-xs text-muted">
                      {new Date(log.timestamp).toLocaleTimeString("pt-PT")}
                    </Text>
                    <Text className="text-xs text-foreground">
                      {log.action.toUpperCase()}: {log.message}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

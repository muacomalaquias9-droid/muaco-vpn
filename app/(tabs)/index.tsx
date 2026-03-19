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

  useEffect(() => {
    loadLogs();
  }, [connection.status]);

  const loadLogs = async () => {
    const logs = await VPNLogger.getRecentLogs(3);
    setRecentLogs(logs);
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
      console.error("Erro:", error);
    }
  };

  const getStatusText = () => {
    switch (connection.status) {
      case "connected":
        return "🔒 Conectado";
      case "connecting":
        return "⏳ Conectando...";
      case "error":
        return "❌ Erro";
      default:
        return "🔓 Desconectado";
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-4 pb-8">
          <Text className="text-2xl font-bold text-foreground">Muaco VPN</Text>

          {/* Status */}
          <View className="bg-primary/10 rounded-lg p-4 border border-primary/20">
            <Text className="text-lg font-bold text-foreground">{getStatusText()}</Text>
            {connection.currentIP && (
              <View className="mt-2 gap-1">
                <Text className="text-xs text-muted">IP: {connection.currentIP}</Text>
                <Text className="text-xs text-muted">Servidor: {connection.server?.name}</Text>
              </View>
            )}
          </View>

          {/* Botão */}
          <Pressable onPress={handleToggleVPN} disabled={loading}>
            {({ pressed }) => (
              <View
                className={cn(
                  "bg-primary rounded-lg py-3 items-center",
                  pressed && "opacity-80",
                  loading && "opacity-50"
                )}
              >
                <Text className="text-white font-bold">
                  {loading ? "Processando..." : connection.status === "connected" ? "Desconectar" : "Conectar"}
                </Text>
              </View>
            )}
          </Pressable>

          {/* Servidores */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Servidores Angola</Text>
            {ANGOLA_VPN_SERVERS.map((server) => (
              <Pressable
                key={server.id}
                onPress={() => {
                  setSelectedServer(server);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                {({ pressed }) => (
                  <View
                    className={cn(
                      "flex-row items-center gap-2 p-2 rounded-lg border",
                      selectedServer?.id === server.id ? "bg-primary/10 border-primary" : "bg-surface border-border",
                      pressed && "opacity-70"
                    )}
                  >
                    {server.icon && <Image source={{ uri: server.icon }} className="w-6 h-6 rounded" />}
                    <View className="flex-1">
                      <Text className="text-xs font-semibold text-foreground">{server.name}</Text>
                      <Text className="text-xs text-muted">{server.operator}</Text>
                    </View>
                    {selectedServer?.id === server.id && <Text>✓</Text>}
                  </View>
                )}
              </Pressable>
            ))}
          </View>

          {/* Logs */}
          {recentLogs.length > 0 && (
            <View className="bg-surface rounded-lg p-3 gap-1">
              <Text className="text-xs font-semibold text-foreground mb-1">Logs</Text>
              {recentLogs.map((log) => (
                <Text key={log.id} className="text-xs text-muted">
                  {new Date(log.timestamp).toLocaleTimeString("pt-PT")}: {log.message}
                </Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

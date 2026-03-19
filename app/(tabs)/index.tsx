import { ScrollView, Text, View, Pressable, ActivityIndicator } from "react-native";
import { useEffect } from "react";

import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useVPN } from "@/hooks/use-vpn";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

export default function HomeScreen() {
  const colors = useColors();
  const { connection, settings, servers, loading, connect, disconnect, fetchServers } = useVPN();

  // Buscar servidores ao iniciar
  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  const handleToggleVPN = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (connection.status === "connected") {
        await disconnect();
      } else if (connection.status === "disconnected" && servers.length > 0) {
        // Usar servidor selecionado ou o primeiro da lista
        const selectedServer = servers[0];
        await connect(selectedServer);
      }
    } catch (error) {
      console.error("Erro ao alternar VPN:", error);
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

  const isConnected = connection.status === "connected";
  const isLoading = loading || connection.status === "connecting" || connection.status === "disconnecting";

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-8">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold text-foreground">Angola VPN</Text>
            <Text className="text-sm text-muted text-center">
              Proteção segura e rápida para seus dados
            </Text>
          </View>

          {/* Status Card */}
          <View
            className={cn(
              "w-full rounded-3xl p-8 items-center justify-center gap-4",
              isConnected ? "bg-success/10" : "bg-surface"
            )}
            style={{
              borderWidth: 2,
              borderColor: getStatusColor(),
            }}
          >
            <View
              className="w-24 h-24 rounded-full items-center justify-center"
              style={{
                backgroundColor: getStatusColor() + "20",
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color={getStatusColor()} />
              ) : (
                <Text className="text-4xl">
                  {isConnected ? "🔒" : "🔓"}
                </Text>
              )}
            </View>

            <Text
              className="text-lg font-semibold"
              style={{ color: getStatusColor() }}
            >
              {getStatusText()}
            </Text>
          </View>

          {/* Server Info */}
          {isConnected && connection.server && (
            <View className="w-full bg-surface rounded-2xl p-6 gap-4">
              <View className="gap-2">
                <Text className="text-xs text-muted uppercase tracking-wider">Servidor Conectado</Text>
                <View className="flex-row items-center gap-3">
                  <Text className="text-3xl">🌍</Text>
                  <View className="flex-1">
                    <Text className="text-xl font-semibold text-foreground">
                      {connection.server.country}
                    </Text>
                    <Text className="text-sm text-muted">{connection.server.ip}</Text>
                  </View>
                </View>
              </View>

              {/* Speed Stats */}
              <View className="flex-row gap-4 pt-4 border-t border-border">
                <View className="flex-1">
                  <Text className="text-xs text-muted mb-1">Download</Text>
                  <Text className="text-lg font-semibold text-foreground">
                    {connection.downloadSpeed?.toFixed(0) || "0"} Mbps
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-muted mb-1">Upload</Text>
                  <Text className="text-lg font-semibold text-foreground">
                    {connection.uploadSpeed?.toFixed(0) || "0"} Mbps
                  </Text>
                </View>
              </View>

              {/* IP Info */}
              <View className="pt-4 border-t border-border gap-2">
                <View>
                  <Text className="text-xs text-muted mb-1">Seu IP</Text>
                  <Text className="text-sm font-mono text-foreground">
                    {connection.currentIP}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* IP Display when Disconnected */}
          {!isConnected && (
            <View className="w-full bg-surface rounded-2xl p-6">
              <View className="gap-2">
                <Text className="text-xs text-muted uppercase tracking-wider">Seu IP Público</Text>
                <Text className="text-2xl font-semibold text-foreground">
                  {connection.originalIP || "Detectando..."}
                </Text>
                <Text className="text-xs text-muted mt-2">
                  Conecte-se para proteger seu IP
                </Text>
              </View>
            </View>
          )}

          {/* Main Toggle Button */}
          <Pressable
            onPress={handleToggleVPN}
            disabled={isLoading || servers.length === 0}
            className="w-full"
          >
            {({ pressed }) => (
              <View
                className={cn(
                  "w-full rounded-full py-6 items-center justify-center",
                  isConnected ? "bg-success" : "bg-primary",
                  pressed && "opacity-80",
                  (isLoading || servers.length === 0) && "opacity-50"
                )}
              >
                <Text className="text-white text-lg font-semibold">
                  {isLoading ? "Processando..." : isConnected ? "Desconectar" : "Conectar"}
                </Text>
              </View>
            )}
          </Pressable>

          {/* Info: Use tab bar to navigate to Servers and Settings */}
          <View className="p-4 bg-surface rounded-2xl border border-border">
            <Text className="text-xs text-muted text-center">
              Use as abas na parte inferior para acessar Servidores e Configurações
            </Text>
          </View>

          {/* Error Message */}
          {connection.status === "error" && (
            <View className="w-full bg-error/10 rounded-2xl p-4 border border-error">
              <Text className="text-sm text-error font-semibold">
                Erro ao conectar. Tente novamente.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

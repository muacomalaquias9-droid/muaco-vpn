import { ScrollView, Text, View, Pressable } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

const SERVERS = [
  { id: 1, name: "Unitel NET", operator: "Unitel", icon: "🟠" },
  { id: 2, name: "Africell 01", operator: "Africell", icon: "🟣" },
  { id: 3, name: "Africell 02", operator: "Africell", icon: "🟣" },
];

export default function HomeScreen() {
  const colors = useColors();
  const [isConnected, setIsConnected] = useState(false);
  const [selectedServer, setSelectedServer] = useState(SERVERS[0]);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleToggle = async () => {
    if (!selectedServer) return;
    
    setIsConnecting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsConnected(!isConnected);
    setIsConnecting(false);
    
    Haptics.notificationAsync(
      isConnected 
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success
    );
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          <Text className="text-3xl font-bold text-foreground">Muaco VPN</Text>

          {/* Status */}
          <View className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
            <Text className="text-sm text-muted mb-2">Status</Text>
            <Text className="text-2xl font-bold text-foreground mb-4">
              {isConnected ? "🔒 Conectado" : "🔓 Desconectado"}
            </Text>
            {isConnected && selectedServer && (
              <View className="gap-1">
                <Text className="text-xs text-muted">Servidor: {selectedServer.name}</Text>
                <Text className="text-xs text-muted">IP: 192.168.1.100</Text>
              </View>
            )}
          </View>

          {/* Botão */}
          <Pressable
            onPress={handleToggle}
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
                onPress={() => setSelectedServer(server)}
                disabled={isConnected}
              >
                {({ pressed }) => (
                  <View
                    className={`flex-row items-center gap-3 p-3 rounded-xl border ${
                      selectedServer.id === server.id
                        ? "bg-primary/10 border-primary"
                        : "bg-surface border-border"
                    }`}
                    style={{ opacity: pressed ? 0.7 : 1 }}
                  >
                    <Text className="text-2xl">{server.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-foreground">{server.name}</Text>
                      <Text className="text-xs text-muted">{server.operator}</Text>
                    </View>
                    {selectedServer.id === server.id && <Text>✓</Text>}
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

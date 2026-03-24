import { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, ScrollView, Image, Modal, ActivityIndicator, NativeModules, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

// Configurar notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const SERVERS = [
  { 
    id: 1, 
    name: "Unitel NET", 
    operator: "Unitel", 
    protocol: "OpenVPN", 
    port: 1194,
    ping: "12ms",
    logo: require("@/assets/images/unitel-logo.png"),
    ip: "vpn-unitel.ao",
    country: "Angola",
    city: "Luanda",
    latitude: -8.8383,
    longitude: 13.2344
  },
  { 
    id: 2, 
    name: "Africell 01", 
    operator: "Africell", 
    protocol: "OpenVPN", 
    port: 1194,
    ping: "18ms",
    logo: require("@/assets/images/africell-logo.png"),
    ip: "vpn-africell-01.ao",
    country: "Angola",
    city: "Luanda",
    latitude: -8.8383,
    longitude: 13.2344
  },
  { 
    id: 3, 
    name: "Africell 02", 
    operator: "Africell", 
    protocol: "WireGuard", 
    port: 51820,
    ping: "22ms",
    logo: require("@/assets/images/africell-logo.png"),
    ip: "vpn-africell-02.ao",
    country: "Angola",
    city: "Luanda",
    latitude: -8.8383,
    longitude: 13.2344
  },
];

export default function HomeScreen() {
  const colors = useColors();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedServer, setSelectedServer] = useState(SERVERS[0]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [protocol, setProtocol] = useState<"OpenVPN" | "WireGuard">("OpenVPN");
  
  // Contadores
  const [connectionTime, setConnectionTime] = useState(0);
  const [dataUsed, setDataUsed] = useState(0);
  const connectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dataIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar notificações
  useEffect(() => {
    const setupNotifications = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    };
    setupNotifications();
  }, []);

  // Timer para conexão
  useEffect(() => {
    if (isConnected) {
      connectionIntervalRef.current = setInterval(() => {
        setConnectionTime(prev => prev + 1);
      }, 1000);
      
      dataIntervalRef.current = setInterval(() => {
        setDataUsed(prev => prev + Math.random() * 0.5);
      }, 1000);
    } else {
      if (connectionIntervalRef.current) clearInterval(connectionIntervalRef.current);
      if (dataIntervalRef.current) clearInterval(dataIntervalRef.current);
      setConnectionTime(0);
      setDataUsed(0);
    }

    return () => {
      if (connectionIntervalRef.current) clearInterval(connectionIntervalRef.current);
      if (dataIntervalRef.current) clearInterval(dataIntervalRef.current);
    };
  }, [isConnected]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const sendNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        badge: 1,
      },
      trigger: null,
    });
  };

  const handleConnect = async () => {
    if (!selectedServer) return;
    setShowPermissionModal(true);
  };

  const confirmConnection = async () => {
    setShowPermissionModal(false);
    setIsConnecting(true);
    
    // Enviar notificação de conexão iniciada
    await sendNotification(
      "Muaco VPN",
      `Conectando a ${selectedServer.name}...`
    );

    // Simular conexão VPN real com 5 segundos
    setTimeout(async () => {
      setIsConnecting(false);
      setIsConnected(true);
      setProtocol(selectedServer.protocol as "OpenVPN" | "WireGuard");
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Iniciar serviço de foreground para notificação persistente (Android)
      if (Platform.OS === "android" && NativeModules.VPNModule) {
        try {
          await NativeModules.VPNModule.startVPN();
        } catch (e) {
          console.log("Erro ao iniciar VPN nativa:", e);
        }
      }
      
      // Enviar notificação de conexão bem-sucedida
      await sendNotification(
        "VPN Conectada",
        `Conectado a ${selectedServer.name} via ${selectedServer.protocol} (Porta ${selectedServer.port})`
      );
    }, 5000);
  };

  const handleDisconnect = async () => {
    setIsConnected(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    // Parar serviço de foreground (Android)
    if (Platform.OS === "android" && NativeModules.VPNModule) {
      try {
        await NativeModules.VPNModule.stopVPN();
      } catch (e) {
        console.log("Erro ao parar VPN nativa:", e);
      }
    }
    
    // Enviar notificação de desconexão
    await sendNotification(
      "VPN Desconectada",
      `Desconectado de ${selectedServer.name} após ${formatTime(connectionTime)}`
    );
  };

  const handleUpdateServers = async () => {
    setIsUpdating(true);
    
    // Enviar notificação de atualização
    await sendNotification(
      "Atualizando Servidores",
      "Buscando servidores mais rápidos..."
    );
    
    // Simular atualização de servidores com 4 segundos
    setTimeout(async () => {
      setIsUpdating(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Enviar notificação de atualização concluída
      await sendNotification(
        "Servidores Atualizados",
        "Lista de servidores atualizada com sucesso"
      );
    }, 4000);
  };

  const switchProtocol = async (newProtocol: "OpenVPN" | "WireGuard") => {
    if (!isConnected) return;
    
    setProtocol(newProtocol);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    await sendNotification(
      "Protocolo Alterado",
      `Protocolo alterado para ${newProtocol}`
    );
  };

  return (
    <ScreenContainer className="p-0">
      <View className="flex-1 bg-black">
        {/* Header com Dashboard */}
        <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-800">
          <View>
            <Text className="text-white text-2xl font-bold">Muaco VPN</Text>
            <Text className="text-gray-400 text-xs">Apenas Angola</Text>
          </View>
          
          <Pressable 
            onPress={() => setShowDashboard(!showDashboard)}
            className="p-2"
          >
            <MaterialIcons name="dashboard" size={24} color="white" />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-4 py-6 gap-6">
            
            {/* Status Card */}
            <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <Text className="text-gray-400 text-xs font-bold mb-3">STATUS</Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-white text-lg font-bold">
                  {isConnecting ? "Conectando..." : isConnected ? "Conectado" : "Desconectado"}
                </Text>
                <View className={`px-4 py-2 rounded-full ${isConnected ? "bg-red-500" : "bg-gray-700"}`}>
                  <Text className="text-white text-sm font-bold">
                    {isConnected ? "Desconectar" : "Desconectado"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Botão Conectar Grande */}
            <View className="items-center py-6">
              <Pressable
                onPress={isConnected ? handleDisconnect : handleConnect}
                disabled={isConnecting}
                className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 items-center justify-center border-8 border-green-600"
              >
                {({ pressed }) => (
                  <View className="items-center" style={{ opacity: pressed ? 0.8 : 1 }}>
                    <MaterialIcons 
                      name={isConnected ? "lock" : "lock-open"} 
                      size={60} 
                      color={isConnected ? "#FFD700" : "#FFFFFF"} 
                    />
                    <Text className="text-white text-xl font-bold mt-4">
                      {isConnecting ? "..." : isConnected ? "Conectado" : "Conectar"}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>

            {/* Servidor Selecionado */}
            <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <Text className="text-gray-400 text-xs font-bold mb-3">SERVIDOR SELECIONADO</Text>
              <View className="flex-row items-center gap-3">
                <Image 
                  source={selectedServer.logo} 
                  style={{ width: 40, height: 40, borderRadius: 8 }}
                />
                <View className="flex-1">
                  <Text className="text-white font-bold">{selectedServer.name}</Text>
                  <Text className="text-gray-400 text-xs">{protocol} Porta {selectedServer.port}</Text>
                  <Text className="text-green-400 text-xs font-bold">Ping: {selectedServer.ping}</Text>
                </View>
              </View>
            </View>

            {/* Protocolo Selecionado */}
            {isConnected && (
              <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                <Text className="text-gray-400 text-xs font-bold mb-3">PROTOCOLO</Text>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => switchProtocol("OpenVPN")}
                    className={`flex-1 py-3 rounded-lg items-center ${
                      protocol === "OpenVPN" ? "bg-blue-600" : "bg-gray-800"
                    }`}
                  >
                    <Text className="text-white font-bold">OpenVPN</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => switchProtocol("WireGuard")}
                    className={`flex-1 py-3 rounded-lg items-center ${
                      protocol === "WireGuard" ? "bg-blue-600" : "bg-gray-800"
                    }`}
                  >
                    <Text className="text-white font-bold">WireGuard</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Dados e Tempo */}
            {isConnected && (
              <View className="gap-3">
                <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                  <View className="flex-row items-center gap-2 mb-2">
                    <MaterialIcons name="schedule" size={16} color="#10B981" />
                    <Text className="text-gray-400 text-xs">TEMPO CONECTADO</Text>
                  </View>
                  <Text className="text-white text-2xl font-bold">{formatTime(connectionTime)}</Text>
                </View>

                <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                  <View className="flex-row items-center gap-2 mb-2">
                    <MaterialIcons name="data-usage" size={16} color="#10B981" />
                    <Text className="text-gray-400 text-xs">DADOS UTILIZADOS</Text>
                  </View>
                  <Text className="text-white text-2xl font-bold">{dataUsed.toFixed(2)} MB</Text>
                </View>
              </View>
            )}

            {/* Servidores */}
            <View className="gap-3">
              <Text className="text-white font-bold">SERVIDORES ANGOLA</Text>
              {SERVERS.map((server) => (
                <Pressable
                  key={server.id}
                  onPress={() => !isConnected && setSelectedServer(server)}
                  disabled={isConnected}
                >
                  {({ pressed }) => (
                    <View
                      className={`flex-row items-center gap-3 p-3 rounded-xl border ${
                        selectedServer.id === server.id
                          ? "bg-blue-900/30 border-blue-500"
                          : "bg-gray-900 border-gray-800"
                      }`}
                      style={{ opacity: pressed ? 0.7 : 1 }}
                    >
                      <Image 
                        source={server.logo} 
                        style={{ width: 40, height: 40, borderRadius: 8 }}
                      />
                      <View className="flex-1">
                        <Text className="text-white font-bold">{server.name}</Text>
                        <Text className="text-gray-400 text-xs">{server.protocol} Porta {server.port}</Text>
                      </View>
                      {selectedServer.id === server.id && (
                        <MaterialIcons name="check-circle" size={20} color="#3B82F6" />
                      )}
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Modal Dashboard */}
        <Modal visible={showDashboard} transparent animationType="fade">
          <Pressable 
            onPress={() => setShowDashboard(false)}
            className="flex-1 bg-black/50 justify-end"
          >
            <View className="bg-gray-900 rounded-t-3xl p-6 gap-4 border-t border-gray-800">
              <Text className="text-white text-lg font-bold">Dashboard</Text>
              
              <Pressable
                onPress={handleUpdateServers}
                disabled={isUpdating}
                className="bg-blue-600 rounded-xl p-4 items-center"
              >
                {isUpdating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="refresh" size={20} color="white" />
                    <Text className="text-white font-bold">Atualizar Servidor</Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                onPress={() => setShowDashboard(false)}
                className="bg-gray-800 rounded-xl p-4 items-center"
              >
                <Text className="text-white font-bold">Fechar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Modal Permissão VPN */}
        <Modal visible={showPermissionModal} transparent animationType="fade">
          <View className="flex-1 bg-black/70 justify-center items-center px-4">
            <View className="bg-gray-900 rounded-2xl p-6 gap-4 border border-gray-800">
              <MaterialIcons name="vpn-lock" size={48} color="#3B82F6" />
              
              <Text className="text-white text-lg font-bold text-center">
                Permissão de VPN
              </Text>
              
              <Text className="text-gray-400 text-sm text-center">
                O aplicativo Muaco VPN precisa de permissão para criar uma conexão VPN segura. Você deseja permitir?
              </Text>

              <View className="gap-3">
                <Pressable
                  onPress={confirmConnection}
                  className="bg-blue-600 rounded-xl p-4 items-center"
                >
                  <Text className="text-white font-bold">Permitir</Text>
                </Pressable>

                <Pressable
                  onPress={() => setShowPermissionModal(false)}
                  className="bg-gray-800 rounded-xl p-4 items-center"
                >
                  <Text className="text-white font-bold">Cancelar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenContainer>
  );
}

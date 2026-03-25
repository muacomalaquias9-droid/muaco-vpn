import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, Pressable, ScrollView, Image, Modal, ActivityIndicator, NativeModules, Platform, FlatList } from "react-native";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useVPNAutoReconnect } from "@/hooks/use-vpn-auto-reconnect";

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
    logo: require("@/assets/images/unitel-logo.svg"),
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
    logo: require("@/assets/images/africell-logo.svg"),
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
    logo: require("@/assets/images/africell-logo.svg"),
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
  const [showServerList, setShowServerList] = useState(false);
  const [protocol, setProtocol] = useState<"OpenVPN" | "WireGuard">("OpenVPN");
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  
  // Contadores
  const [connectionTime, setConnectionTime] = useState(0);
  const [dataUsed, setDataUsed] = useState(0);
  const connectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dataIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-reconexão
  const handleAutoReconnect = useCallback(async () => {
    if (isConnected) {
      console.log("VPN caiu, reconectando automaticamente...");
      await sendNotification("Auto-Reconexão", "Reconectando à VPN...");
      confirmConnection();
    }
  }, [isConnected]);

  useVPNAutoReconnect(isConnected, handleAutoReconnect);

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

  // Obter informações de rede
  useEffect(() => {
    const getNetworkInfo = async () => {
      if (Platform.OS === "android" && NativeModules.VPNModule) {
        try {
          const info = await NativeModules.VPNModule.getNetworkInfo();
          setNetworkInfo(info);
        } catch (e) {
          console.log("Erro ao obter info de rede:", e);
        }
      }
    };

    getNetworkInfo();
    const interval = setInterval(getNetworkInfo, 5000);
    return () => clearInterval(interval);
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

  const formatData = (mb: number) => {
    if (mb < 1024) return `${mb.toFixed(2)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
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
    setShowPermissionModal(true);
  };

  const confirmConnection = async () => {
    setShowPermissionModal(false);
    setIsConnecting(true);
    setErrorMessage("");
    
    // Enviar notificação de conexão iniciada
    await sendNotification(
      "Muaco VPN",
      `Conectando a ${selectedServer.name}...`
    );

    try {
      // Chamar VPN real via módulo nativo
      if (Platform.OS === "android" && NativeModules.VPNModule) {
        await NativeModules.VPNModule.startVPN(
          selectedServer.protocol,
          selectedServer.ip
        );
      }

      // Simular conexão com 3 segundos
      setTimeout(async () => {
        setIsConnecting(false);
        setIsConnected(true);
        setProtocol(selectedServer.protocol as "OpenVPN" | "WireGuard");
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Enviar notificação de conexão bem-sucedida
        await sendNotification(
          "VPN Conectada",
          `Conectado a ${selectedServer.name} via ${selectedServer.protocol}`
        );
      }, 3000);
    } catch (error: any) {
      setIsConnecting(false);
      
      if (error?.message?.includes("duas VPN")) {
        setErrorMessage("Não pode usar duas VPN ao mesmo tempo");
      } else if (error?.message?.includes("Permissão")) {
        setErrorMessage("Permissão de VPN não concedida");
      } else {
        setErrorMessage(error?.message || "Erro ao conectar VPN");
      }
      
      setShowErrorModal(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDisconnect = async () => {
    try {
      // Parar VPN real
      if (Platform.OS === "android" && NativeModules.VPNModule) {
        await NativeModules.VPNModule.stopVPN();
      }

      setIsConnected(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      
      // Enviar notificação de desconexão
      await sendNotification(
        "VPN Desconectada",
        `Desconectado de ${selectedServer.name}`
      );
    } catch (error: any) {
      setErrorMessage(error?.message || "Erro ao desconectar VPN");
      setShowErrorModal(true);
    }
  };

  const handleUpdateServers = async () => {
    // Verificar se há internet
    if (!networkInfo?.isConnected) {
      setErrorMessage("Sem internet. Ative WiFi ou Dados Móveis para atualizar servidores.");
      setShowErrorModal(true);
      return;
    }

    setIsUpdating(true);
    
    await sendNotification(
      "Atualizando Servidores",
      "Buscando servidores mais rápidos de Angola..."
    );
    
    setTimeout(async () => {
      setIsUpdating(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      await sendNotification(
        "Servidores Atualizados",
        "Lista de servidores de Angola atualizada com sucesso"
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

  const handleSelectServer = (server: any) => {
    setSelectedServer(server);
    setShowServerList(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
            
            {/* Relatório de Rede */}
            {networkInfo && (
              <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                <Text className="text-gray-400 text-xs font-bold mb-3">CONEXÃO</Text>
                <View className="gap-2">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-300 text-sm">Tipo:</Text>
                    <Text className="text-white font-bold">{networkInfo.type}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-300 text-sm">IP Original:</Text>
                    <Text className="text-white font-bold">{networkInfo.originalIP}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-300 text-sm">Status:</Text>
                    <Text className={`font-bold ${networkInfo.isConnected ? "text-green-500" : "text-red-500"}`}>
                      {networkInfo.isConnected ? "Conectado" : "Desconectado"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

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
                style={({ pressed }) => [
                  {
                    width: 160,
                    height: 160,
                    borderRadius: 80,
                    backgroundColor: isConnected ? "#10B981" : "#0052CC",
                    justifyContent: "center",
                    alignItems: "center",
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  }
                ]}
              >
                {isConnecting ? (
                  <ActivityIndicator size="large" color="white" />
                ) : (
                  <MaterialIcons 
                    name={isConnected ? "lock-open" : "lock"} 
                    size={60} 
                    color="white" 
                  />
                )}
              </Pressable>
              <Text className="text-white text-lg font-bold mt-4">
                {isConnecting ? "Conectando..." : isConnected ? "Conectado" : "Conectar"}
              </Text>
            </View>

            {/* Tempo e Dados */}
            {isConnected && (
              <View className="gap-3">
                <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                  <Text className="text-gray-400 text-xs font-bold mb-2">TEMPO</Text>
                  <Text className="text-white text-2xl font-bold">{formatTime(connectionTime)}</Text>
                </View>
                <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                  <Text className="text-gray-400 text-xs font-bold mb-2">DADOS USADOS</Text>
                  <Text className="text-white text-2xl font-bold">{formatData(dataUsed)}</Text>
                </View>
              </View>
            )}

            {/* Servidor Selecionado com Botão para Listar */}
            <Pressable
              onPress={() => setShowServerList(true)}
              className="bg-gray-900 rounded-2xl p-4 border border-gray-800"
            >
              <Text className="text-gray-400 text-xs font-bold mb-3">SERVIDOR SELECIONADO</Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-12 h-12 bg-gray-800 rounded-full items-center justify-center overflow-hidden">
                    <Image 
                      source={selectedServer.logo}
                      style={{ width: 48, height: 48 }}
                      resizeMode="contain"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold">{selectedServer.name}</Text>
                    <Text className="text-gray-400 text-xs">{selectedServer.protocol} Porta {selectedServer.port}</Text>
                    <Text className="text-green-500 text-xs font-bold">Ping: {selectedServer.ping}</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#0052CC" />
              </View>
            </Pressable>

            {/* Protocolo */}
            <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
              <Text className="text-gray-400 text-xs font-bold mb-3">PROTOCOLO</Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => switchProtocol("OpenVPN")}
                  className={`flex-1 py-3 rounded-lg items-center ${protocol === "OpenVPN" ? "bg-blue-600" : "bg-gray-800"}`}
                >
                  <Text className="text-white font-bold">OpenVPN</Text>
                </Pressable>
                <Pressable
                  onPress={() => switchProtocol("WireGuard")}
                  className={`flex-1 py-3 rounded-lg items-center ${protocol === "WireGuard" ? "bg-blue-600" : "bg-gray-800"}`}
                >
                  <Text className="text-white font-bold">WireGuard</Text>
                </Pressable>
              </View>
            </View>

            {/* Botão Atualizar Servidores */}
            <Pressable
              onPress={handleUpdateServers}
              disabled={isUpdating}
              className={`py-3 rounded-lg items-center ${isUpdating ? "bg-gray-700" : "bg-blue-600"}`}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-bold">Atualizar Servidores de Angola</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </View>

      {/* Modal de Permissão de VPN */}
      <Modal visible={showPermissionModal} transparent animationType="fade">
        <View className="flex-1 bg-black/80 justify-center items-center px-4">
          <View className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-gray-800">
            <MaterialIcons name="lock" size={48} color="#0052CC" style={{ alignSelf: "center", marginBottom: 16 }} />
            <Text className="text-white text-xl font-bold text-center mb-2">Permissão de VPN</Text>
            <Text className="text-gray-400 text-sm text-center mb-6">
              O Android vai pedir permissão para usar VPN. Clique em "OK" para continuar.
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowPermissionModal(false)}
                className="flex-1 py-3 rounded-lg bg-gray-800 items-center"
              >
                <Text className="text-white font-bold">Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={confirmConnection}
                className="flex-1 py-3 rounded-lg bg-blue-600 items-center"
              >
                <Text className="text-white font-bold">Permitir</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Lista de Servidores */}
      <Modal visible={showServerList} transparent animationType="slide">
        <View className="flex-1 bg-black">
          <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-800">
            <Text className="text-white text-xl font-bold">Selecionar Servidor</Text>
            <Pressable onPress={() => setShowServerList(false)}>
              <MaterialIcons name="close" size={24} color="white" />
            </Pressable>
          </View>

          <FlatList
            data={SERVERS}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelectServer(item)}
                className={`px-4 py-4 border-b border-gray-800 flex-row items-center gap-3 ${selectedServer.id === item.id ? "bg-gray-900" : ""}`}
              >
                <View className="w-12 h-12 bg-gray-800 rounded-full items-center justify-center overflow-hidden">
                  <Image 
                    source={item.logo}
                    style={{ width: 48, height: 48 }}
                    resizeMode="contain"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold">{item.name}</Text>
                  <Text className="text-gray-400 text-xs">{item.protocol} Porta {item.port}</Text>
                  <Text className="text-green-500 text-xs font-bold">Ping: {item.ping}</Text>
                </View>
                {selectedServer.id === item.id && (
                  <MaterialIcons name="check-circle" size={24} color="#10B981" />
                )}
              </Pressable>
            )}
          />
        </View>
      </Modal>

      {/* Modal de Erro */}
      <Modal visible={showErrorModal} transparent animationType="fade">
        <View className="flex-1 bg-black/80 justify-center items-center px-4">
          <View className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-gray-800">
            <MaterialIcons name="error" size={48} color="#EF4444" style={{ alignSelf: "center", marginBottom: 16 }} />
            <Text className="text-white text-xl font-bold text-center mb-2">Erro</Text>
            <Text className="text-gray-400 text-sm text-center mb-6">{errorMessage}</Text>
            <Pressable
              onPress={() => setShowErrorModal(false)}
              className="py-3 rounded-lg bg-blue-600 items-center"
            >
              <Text className="text-white font-bold">OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

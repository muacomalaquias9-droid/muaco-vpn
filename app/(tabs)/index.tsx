import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, Pressable, ScrollView, Image, Modal, ActivityIndicator, NativeModules, Platform, FlatList } from "react-native";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useVPNAutoReconnect } from "@/hooks/use-vpn-auto-reconnect";
import { useVPNAudio } from "@/hooks/use-vpn-audio";
import { useDeviceLocation } from "@/hooks/use-device-location";

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
  // Angola - Unitel
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
  // Angola - Africell
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
  // Moçambique - Movicel
  { 
    id: 4, 
    name: "Movicel MZ", 
    operator: "Movicel", 
    protocol: "OpenVPN", 
    port: 1194,
    ping: "15ms",
    logo: require("@/assets/images/movicel-logo.svg"),
    ip: "vpn-movicel.mz",
    country: "Moçambique",
    city: "Maputo",
    latitude: -23.8645,
    longitude: 35.3047
  },
  // Moçambique - Vodacom
  { 
    id: 5, 
    name: "Vodacom MZ", 
    operator: "Vodacom", 
    protocol: "WireGuard", 
    port: 51820,
    ping: "20ms",
    logo: require("@/assets/images/vodacom-logo.svg"),
    ip: "vpn-vodacom.mz",
    country: "Moçambique",
    city: "Maputo",
    latitude: -23.8645,
    longitude: 35.3047
  },
];

export default function HomeScreen() {
  const colors = useColors();
  const { playConnectSound, playDisconnectSound, playReconnectSound, playErrorSound } = useVPNAudio();
  const { location, isLoading: isLoadingLocation } = useDeviceLocation();
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
  const [showSpeedTest, setShowSpeedTest] = useState(false);
  
  // Contadores
  const [connectionTime, setConnectionTime] = useState(0);
  const [dataUsed, setDataUsed] = useState(0);
  const connectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dataIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef("active");

  // Auto-reconexão com som
  const handleAutoReconnect = useCallback(async () => {
    if (isConnected) {
      console.log("VPN caiu, reconectando automaticamente...");
      await playReconnectSound();
      await sendNotification("Auto-Reconexão", "Reconectando à VPN...");
      confirmConnection();
    }
  }, [isConnected, playReconnectSound]);

  useVPNAutoReconnect(isConnected, handleAutoReconnect);

  // Evitar reinicialização ao fechar APK
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      appStateRef.current = nextAppState;
      // Não fazer nada, apenas manter o estado
    };

    // Não reiniciar ao sair
    return () => {
      // Limpar apenas se desconectado
      if (!isConnected) {
        // Não fazer nada
      }
    };
  }, [isConnected]);

  // Inicializar notificações
  useEffect(() => {
    const setupNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Permissão de notificações negada");
      }
    };
    setupNotifications();
  }, []);

  // Obter informações de rede
  useEffect(() => {
    const getNetworkInfo = async () => {
      try {
        const VPNModule = NativeModules.VPNModule;
        const info = await VPNModule.getNetworkInfo();
        setNetworkInfo(info);
      } catch (error) {
        console.error("Erro ao obter info de rede:", error);
      }
    };

    getNetworkInfo();
    const interval = setInterval(getNetworkInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  // Enviar notificação
  const sendNotification = async (title: string, body: string) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          badge: 1,
        },
        trigger: null,
      });
    } catch (e) {
      console.log("Erro ao enviar notificação:", e);
    }
  };

  // Conectar à VPN
  const confirmConnection = useCallback(async () => {
    try {
      setIsConnecting(true);
      setErrorMessage("");
      
      const VPNModule = NativeModules.VPNModule;
      
      // Solicitar permissão de VPN
      const permissionResult = await VPNModule.requestVPNPermission();
      if (permissionResult === "PERMISSION_REQUIRED") {
        setShowPermissionModal(true);
        return;
      }
      
      // Iniciar VPN
      await VPNModule.startVPN(protocol, selectedServer.ip);
      
      // Reproduzir som de conexão
      await playConnectSound();
      
      // Enviar notificação
      await sendNotification("VPN Conectada", `Conectado a ${selectedServer.name}`);
      
      setIsConnected(true);
      setShowDashboard(true);
      
      // Iniciar contadores
      if (connectionIntervalRef.current) clearInterval(connectionIntervalRef.current);
      connectionIntervalRef.current = setInterval(() => {
        setConnectionTime((prev) => prev + 1);
      }, 1000);
      
      if (dataIntervalRef.current) clearInterval(dataIntervalRef.current);
      dataIntervalRef.current = setInterval(() => {
        setDataUsed((prev) => prev + Math.random() * 0.5);
      }, 1000);
    } catch (error: any) {
      console.error("Erro ao conectar:", error);
      await playErrorSound();
      setErrorMessage(error.message || "Erro ao conectar à VPN");
      setShowErrorModal(true);
    } finally {
      setIsConnecting(false);
    }
  }, [protocol, selectedServer, playConnectSound, playErrorSound]);

  // Desconectar da VPN
  const handleDisconnect = useCallback(async () => {
    try {
      const VPNModule = NativeModules.VPNModule;
      await VPNModule.stopVPN();
      
      // Reproduzir som de desconexão
      await playDisconnectSound();
      
      setIsConnected(false);
      setShowDashboard(false);
      setConnectionTime(0);
      setDataUsed(0);
      
      if (connectionIntervalRef.current) clearInterval(connectionIntervalRef.current);
      if (dataIntervalRef.current) clearInterval(dataIntervalRef.current);
      
      await sendNotification("VPN Desconectada", "Você foi desconectado da VPN");
    } catch (error: any) {
      console.error("Erro ao desconectar:", error);
      await playErrorSound();
      setErrorMessage(error.message || "Erro ao desconectar da VPN");
      setShowErrorModal(true);
    }
  }, [playDisconnectSound, playErrorSound]);

  // Atualizar servidores
  const handleUpdateServers = async () => {
    setIsUpdating(true);
    try {
      await sendNotification("Atualizando", "Buscando servidores mais rápidos de Angola e Moçambique...");
      // Simular atualização
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await sendNotification("Atualização Concluída", "Servidores atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Formatar tempo
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Formatar dados
  const formatData = (mb: number) => {
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <ScreenContainer className="bg-black">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 px-4 py-6 gap-4">
          {/* Notificação de VPN Conectada */}
          {isConnected && (
            <View className="bg-green-900/30 border border-green-600 rounded-lg p-3 flex-row items-center gap-2">
              <MaterialIcons name="check-circle" size={20} color="#10B981" />
              <Text className="text-green-400 text-sm font-semibold flex-1">VPN Conectada • Agora</Text>
            </View>
          )}

          {/* Status */}
          <View className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <Text className="text-gray-400 text-sm font-semibold mb-2">STATUS</Text>
            <Text className="text-white text-2xl font-bold">{isConnected ? "Conectado" : "Desconectado"}</Text>
          </View>

          {/* Botão VPN Grande */}
          <Pressable
            onPress={isConnected ? handleDisconnect : confirmConnection}
            disabled={isConnecting}
            className="items-center justify-center py-8"
          >
            <View
              className={`w-40 h-40 rounded-full items-center justify-center ${
                isConnected ? "bg-green-500" : "bg-blue-600"
              } ${isConnecting ? "opacity-50" : ""}`}
            >
              {isConnecting ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <MaterialIcons name={isConnected ? "lock-open" : "lock"} size={80} color="white" />
              )}
            </View>
            <Text className="text-white text-lg font-bold mt-4">
              {isConnecting ? "Conectando..." : isConnected ? "Desconectar" : "Conectar"}
            </Text>
          </Pressable>

          {/* Dashboard de Conexão */}
          {showDashboard && (
            <View className="bg-gray-900 rounded-2xl p-6 border border-gray-800 gap-4">
              <View className="gap-3">
                <View className="flex-row justify-between">
                  <Text className="text-gray-400 text-sm">Tempo de Conexão</Text>
                  <Text className="text-green-400 font-bold">{formatTime(connectionTime)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400 text-sm">Dados Utilizados</Text>
                  <Text className="text-green-400 font-bold">{formatData(dataUsed)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Servidor Selecionado */}
          <Pressable
            onPress={() => setShowServerList(true)}
            className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-12 h-12 bg-orange-500 rounded-full items-center justify-center">
                <Text className="text-white font-bold text-lg">{selectedServer.operator.charAt(0)}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold">{selectedServer.name}</Text>
                <Text className="text-gray-400 text-xs">{selectedServer.protocol} Porta {selectedServer.port}</Text>
                <Text className="text-green-400 text-xs">Ping: {selectedServer.ping}</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
          </Pressable>

          {/* Informações de Rede */}
          <View className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-800">
            <Text className="text-white text-sm font-bold mb-2">Informações de Rede</Text>
            <Text className="text-gray-400 text-xs">Tipo: {networkInfo?.type || "Detectando..."}</Text>
            <Text className="text-gray-400 text-xs">IP Original: {networkInfo?.originalIP || "--"}</Text>
            {location && (
              <>
                <Text className="text-gray-400 text-xs">Localização: {location.city}, {location.country}</Text>
                <Text className="text-gray-400 text-xs">Coordenadas: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</Text>
              </>
            )}
          </View>

          {/* Protocolo */}
          <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <Text className="text-gray-400 text-sm font-semibold mb-3">PROTOCOLO</Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setProtocol("OpenVPN")}
                className={`flex-1 py-3 rounded-lg items-center ${protocol === "OpenVPN" ? "bg-blue-600" : "bg-gray-800"}`}
              >
                <Text className="text-white font-bold">OpenVPN</Text>
              </Pressable>
              <Pressable
                onPress={() => setProtocol("WireGuard")}
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
              <Text className="text-white font-bold">Atualizar Servidores de Angola e Moçambique</Text>
            )}
          </Pressable>

          {/* Botão Speed Test */}
          <Pressable
            onPress={() => setShowSpeedTest(true)}
            className="py-3 rounded-lg bg-purple-600 items-center"
          >
            <Text className="text-white font-bold">⚡ Speed Test</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Modal de Lista de Servidores */}
      <Modal visible={showServerList} transparent animationType="slide">
        <View className="flex-1 bg-black/95">
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
                onPress={() => {
                  setSelectedServer(item);
                  setShowServerList(false);
                }}
                className="px-4 py-4 border-b border-gray-800 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-12 h-12 bg-orange-500 rounded-full items-center justify-center">
                    <Text className="text-white font-bold">{item.operator.charAt(0)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold">{item.name}</Text>
                    <Text className="text-gray-400 text-xs">{item.country} • {item.city}</Text>
                    <Text className="text-green-400 text-xs">Ping: {item.ping}</Text>
                  </View>
                </View>
                {selectedServer.id === item.id && (
                  <MaterialIcons name="check-circle" size={24} color="#10B981" />
                )}
              </Pressable>
            )}
          />
        </View>
      </Modal>

      {/* Modal de Permissão de VPN */}
      <Modal visible={showPermissionModal} transparent animationType="fade">
        <View className="flex-1 bg-black/80 justify-center items-center px-4">
          <View className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-gray-800">
            <MaterialIcons name="lock" size={48} color="#0052CC" style={{ alignSelf: "center", marginBottom: 16 }} />
            <Text className="text-white text-xl font-bold text-center mb-2">Permissão de VPN</Text>
            <Text className="text-gray-400 text-sm text-center mb-6">
              O Android precisa de sua permissão para gerenciar a conexão VPN
            </Text>
            <Pressable
              onPress={() => {
                setShowPermissionModal(false);
                confirmConnection();
              }}
              className="py-3 rounded-lg bg-blue-600 items-center"
            >
              <Text className="text-white font-bold">Permitir</Text>
            </Pressable>
          </View>
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

      {/* Modal de Speed Test */}
      <Modal visible={showSpeedTest} transparent animationType="slide">
        <View className="flex-1 bg-black">
          <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-800">
            <Text className="text-white text-xl font-bold">Speed Test</Text>
            <Pressable onPress={() => setShowSpeedTest(false)}>
              <MaterialIcons name="close" size={24} color="white" />
            </Pressable>
          </View>
          <View className="flex-1 bg-white items-center justify-center">
            <Text className="text-center text-gray-600 px-4">Speed Test disponível em breve</Text>
            <Text className="text-center text-gray-400 text-sm px-4 mt-2">Abra em um navegador para testar a velocidade</Text>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

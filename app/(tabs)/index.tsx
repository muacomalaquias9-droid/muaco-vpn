import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert, Linking } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

type VPNServer = {
  id: string;
  name: string;
  country: string;
  protocol: string;
  port: number;
};

const SERVERS: VPNServer[] = [
  { id: "unitel", name: "Unitel NET", country: "Angola", protocol: "OpenVPN UDP", port: 1194 },
  { id: "africell1", name: "Africell 01", country: "Angola", protocol: "OpenVPN UDP", port: 1194 },
  { id: "africell2", name: "Africell 02", country: "Angola", protocol: "OpenVPN TCP", port: 443 },
];

export default function HomeScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedServer, setSelectedServer] = useState<VPNServer>(SERVERS[0]);
  const [showServerModal, setShowServerModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [connectionTime, setConnectionTime] = useState(0);
  const [dataUsed, setDataUsed] = useState(0);
  const connectionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dataTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simular contagem de tempo de conexão
  useEffect(() => {
    if (isConnected) {
      connectionTimerRef.current = setInterval(() => {
        setConnectionTime((prev) => prev + 1);
      }, 1000);

      dataTimerRef.current = setInterval(() => {
        setDataUsed((prev) => prev + Math.random() * 0.5); // 0-0.5 MB por segundo
      }, 1000);
    } else {
      if (connectionTimerRef.current) clearInterval(connectionTimerRef.current);
      if (dataTimerRef.current) clearInterval(dataTimerRef.current);
      setConnectionTime(0);
      setDataUsed(0);
    }

    return () => {
      if (connectionTimerRef.current) clearInterval(connectionTimerRef.current);
      if (dataTimerRef.current) clearInterval(dataTimerRef.current);
    };
  }, [isConnected]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleConnect = () => {
    setShowPermissionModal(true);
  };

  const handlePermissionGranted = () => {
    setShowPermissionModal(false);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  const handleUpdateServer = () => {
    setShowServerModal(true);
  };

  const selectServer = (server: VPNServer) => {
    setSelectedServer(server);
    setShowServerModal(false);
  };

  return (
    <ScreenContainer className="bg-black flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-4 py-6">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-white text-3xl font-bold">Muaco VPN</Text>
            <Text className="text-gray-400 text-sm mt-1">Apenas Angola 🇦🇴</Text>
          </View>

          {/* Status Card */}
          <View className="bg-gray-900 rounded-2xl p-4 mb-6 border border-gray-800">
            <Text className="text-gray-400 text-xs uppercase tracking-widest mb-2">Status</Text>
            <View className="flex-row items-center justify-between">
              <Text className={`text-xl font-bold ${isConnected ? "text-green-500" : "text-red-500"}`}>
                {isConnected ? "🔒 Conectado" : "❌ Desconectado"}
              </Text>
              {isConnected && (
                <View className="bg-green-500 rounded-full w-3 h-3 animate-pulse" />
              )}
            </View>
          </View>

          {/* Main VPN Button */}
          <View className="items-center mb-8">
            <TouchableOpacity
              onPress={isConnected ? handleDisconnect : handleConnect}
              className={`w-40 h-40 rounded-full items-center justify-center ${
                isConnected ? "bg-red-600" : "bg-blue-600"
              } shadow-lg`}
            >
              <Text className="text-5xl mb-2">{isConnected ? "🔓" : "🔒"}</Text>
              <Text className="text-white font-bold text-lg">{isConnected ? "Desconectar" : "Conectar"}</Text>
            </TouchableOpacity>
          </View>

          {/* Server Info */}
          <View className="bg-gray-900 rounded-2xl p-4 mb-6 border border-gray-800">
            <Text className="text-gray-400 text-xs uppercase tracking-widest mb-3">Servidor Selecionado</Text>
            <Text className="text-white text-lg font-bold mb-1">{selectedServer.name}</Text>
            <Text className="text-gray-400 text-sm mb-3">{selectedServer.protocol} {selectedServer.port}</Text>
            <TouchableOpacity
              onPress={handleUpdateServer}
              className="bg-blue-600 rounded-lg py-2 px-4"
            >
              <Text className="text-white font-semibold text-center">Atualizar Servidor</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          {isConnected && (
            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 bg-gray-900 rounded-2xl p-4 border border-gray-800">
                <Text className="text-gray-400 text-xs uppercase tracking-widest mb-2">Tempo</Text>
                <Text className="text-green-500 text-lg font-bold">{formatTime(connectionTime)}</Text>
              </View>
              <View className="flex-1 bg-gray-900 rounded-2xl p-4 border border-gray-800">
                <Text className="text-gray-400 text-xs uppercase tracking-widest mb-2">Dados</Text>
                <Text className="text-green-500 text-lg font-bold">{dataUsed.toFixed(1)} MB</Text>
              </View>
            </View>
          )}

          {/* Dashboard Info */}
          <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <Text className="text-gray-400 text-xs uppercase tracking-widest mb-2">Dashboard</Text>
            <Text className="text-white text-sm leading-relaxed">
              {isConnected
                ? `Conectado ao servidor ${selectedServer.name}. Clique em "Atualizar Servidor" para mudar de servidor.`
                : "Clique em Conectar para iniciar a VPN. Será solicitada permissão de VPN."}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Server Selection Modal */}
      <Modal visible={showServerModal} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-gray-900 rounded-t-3xl p-6">
            <Text className="text-white text-xl font-bold mb-4">Selecionar Servidor</Text>
            {SERVERS.map((server) => (
              <TouchableOpacity
                key={server.id}
                onPress={() => selectServer(server)}
                className={`p-4 rounded-lg mb-2 border ${
                  selectedServer.id === server.id
                    ? "bg-blue-600 border-blue-500"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <Text className="text-white font-semibold">{server.name}</Text>
                <Text className="text-gray-400 text-sm">{server.protocol} {server.port}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowServerModal(false)}
              className="bg-gray-800 rounded-lg p-4 mt-4"
            >
              <Text className="text-white font-semibold text-center">Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* VPN Permission Modal */}
      <Modal visible={showPermissionModal} transparent animationType="fade">
        <View className="flex-1 bg-black/80 justify-center items-center px-4">
          <View className="bg-gray-900 rounded-2xl p-6 border border-gray-800 w-full max-w-sm">
            <Text className="text-white text-lg font-bold mb-4">Permissão de VPN</Text>
            <Text className="text-gray-300 text-sm mb-6 leading-relaxed">
              Este dispositivo será ligado à Internet através da app Muaco VPN. A sua atividade de rede, incluindo dados de navegação e emails, está visível para o seu administrador de TI.
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowPermissionModal(false)}
                className="flex-1 bg-gray-800 rounded-lg py-3"
              >
                <Text className="text-white font-semibold text-center">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePermissionGranted}
                className="flex-1 bg-blue-600 rounded-lg py-3"
              >
                <Text className="text-white font-semibold text-center">OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

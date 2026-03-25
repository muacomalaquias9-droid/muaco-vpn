import { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Modal, TextInput, Switch } from "react-native";
import * as Haptics from "expo-haptics";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function SettingsScreen() {
  const colors = useColors();
  const [customDNS, setCustomDNS] = useState("8.8.8.8");
  const [showDNSModal, setShowDNSModal] = useState(false);
  const [tempDNS, setTempDNS] = useState(customDNS);
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [killSwitch, setKillSwitch] = useState(true);
  const [splitTunneling, setSplitTunneling] = useState(false);
  const [ipv6, setIpv6] = useState(false);

  const handleSaveDNS = () => {
    if (tempDNS.trim()) {
      setCustomDNS(tempDNS);
      setShowDNSModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleResetDNS = () => {
    setTempDNS("8.8.8.8");
    setCustomDNS("8.8.8.8");
    setShowDNSModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ScreenContainer className="p-0">
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="px-4 py-4 border-b border-gray-800">
          <Text className="text-white text-2xl font-bold">Configurações</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-4 py-6 gap-4">
            
            {/* Seção: Rede */}
            <View>
              <Text className="text-gray-400 text-xs font-bold mb-3 px-2">REDE</Text>
              
              {/* DNS Customizado */}
              <Pressable
                onPress={() => {
                  setTempDNS(customDNS);
                  setShowDNSModal(true);
                }}
                className="bg-gray-900 rounded-2xl p-4 border border-gray-800 mb-3"
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-white font-bold mb-1">DNS Customizado</Text>
                    <Text className="text-gray-400 text-sm">{customDNS}</Text>
                  </View>
                  <MaterialIcons name="edit" size={20} color="#0052CC" />
                </View>
              </Pressable>

              {/* IPv6 */}
              <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800 mb-3 flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-white font-bold">IPv6</Text>
                  <Text className="text-gray-400 text-sm">Suporte a IPv6</Text>
                </View>
                <Switch
                  value={ipv6}
                  onValueChange={(value) => {
                    setIpv6(value);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  trackColor={{ false: "#4B5563", true: "#0052CC" }}
                  thumbColor={ipv6 ? "#10B981" : "#9CA3AF"}
                />
              </View>
            </View>

            {/* Seção: Segurança */}
            <View>
              <Text className="text-gray-400 text-xs font-bold mb-3 px-2">SEGURANÇA</Text>
              
              {/* Kill Switch */}
              <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800 mb-3 flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-white font-bold">Kill Switch</Text>
                  <Text className="text-gray-400 text-sm">Bloqueia internet se VPN cair</Text>
                </View>
                <Switch
                  value={killSwitch}
                  onValueChange={(value) => {
                    setKillSwitch(value);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  trackColor={{ false: "#4B5563", true: "#0052CC" }}
                  thumbColor={killSwitch ? "#10B981" : "#9CA3AF"}
                />
              </View>

              {/* Split Tunneling */}
              <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800 mb-3 flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-white font-bold">Split Tunneling</Text>
                  <Text className="text-gray-400 text-sm">Alguns apps sem VPN</Text>
                </View>
                <Switch
                  value={splitTunneling}
                  onValueChange={(value) => {
                    setSplitTunneling(value);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  trackColor={{ false: "#4B5563", true: "#0052CC" }}
                  thumbColor={splitTunneling ? "#10B981" : "#9CA3AF"}
                />
              </View>
            </View>

            {/* Seção: Conexão */}
            <View>
              <Text className="text-gray-400 text-xs font-bold mb-3 px-2">CONEXÃO</Text>
              
              {/* Auto-Reconexão */}
              <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800 mb-3 flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-white font-bold">Auto-Reconexão</Text>
                  <Text className="text-gray-400 text-sm">Reconecta se cair</Text>
                </View>
                <Switch
                  value={autoReconnect}
                  onValueChange={(value) => {
                    setAutoReconnect(value);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  trackColor={{ false: "#4B5563", true: "#0052CC" }}
                  thumbColor={autoReconnect ? "#10B981" : "#9CA3AF"}
                />
              </View>
            </View>

            {/* Seção: Sobre */}
            <View>
              <Text className="text-gray-400 text-xs font-bold mb-3 px-2">SOBRE</Text>
              
              <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                <View className="mb-4">
                  <Text className="text-gray-400 text-sm">Versão</Text>
                  <Text className="text-white font-bold">1.0.0</Text>
                </View>
                <View>
                  <Text className="text-gray-400 text-sm">Desenvolvido para Angola</Text>
                  <Text className="text-white font-bold">Muaco VPN</Text>
                </View>
              </View>
            </View>

            {/* Espaço */}
            <View className="h-8" />
          </View>
        </ScrollView>
      </View>

      {/* Modal de DNS */}
      <Modal visible={showDNSModal} transparent animationType="fade">
        <View className="flex-1 bg-black/80 justify-center items-center px-4">
          <View className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-gray-800">
            <Text className="text-white text-xl font-bold mb-4">DNS Customizado</Text>
            
            <TextInput
              value={tempDNS}
              onChangeText={setTempDNS}
              placeholder="Digite o DNS (ex: 8.8.8.8)"
              placeholderTextColor="#6B7280"
              className="bg-gray-800 text-white rounded-lg p-3 mb-4 border border-gray-700"
              keyboardType="decimal-pad"
            />

            <Text className="text-gray-400 text-xs mb-4">
              DNS padrão: 8.8.8.8 (Google) ou 1.1.1.1 (Cloudflare)
            </Text>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowDNSModal(false)}
                className="flex-1 py-3 rounded-lg bg-gray-800 items-center"
              >
                <Text className="text-white font-bold">Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={handleResetDNS}
                className="flex-1 py-3 rounded-lg bg-gray-700 items-center"
              >
                <Text className="text-white font-bold">Padrão</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveDNS}
                className="flex-1 py-3 rounded-lg bg-blue-600 items-center"
              >
                <Text className="text-white font-bold">Salvar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

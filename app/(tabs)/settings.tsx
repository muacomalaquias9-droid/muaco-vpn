import { ScrollView, Text, View, Pressable, Switch } from "react-native";
import { useEffect, useState } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { useVPN } from "@/hooks/use-vpn";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";
import { VPNProtocol } from "@/lib/types";

export default function SettingsScreen() {
  const colors = useColors();
  const { settings, updateSettings } = useVPN();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleToggleSetting = async (key: string, value: boolean) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    await updateSettings(updated);
  };

  const handleProtocolChange = async (protocol: VPNProtocol) => {
    const updated = { ...localSettings, protocol };
    setLocalSettings(updated);
    await updateSettings(updated);
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Configurações</Text>
            <Text className="text-sm text-muted">Personalize sua experiência VPN</Text>
          </View>

          {/* VPN Protocol Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Protocolo VPN</Text>
            <View className="gap-2">
              {(["openvpn", "wireguard"] as const).map((protocol) => (
                <Pressable
                  key={protocol}
                  onPress={() => handleProtocolChange(protocol)}
                  className="flex-1"
                >
                  {({ pressed }) => (
                    <View
                      className={cn(
                        "flex-row items-center gap-3 p-4 rounded-2xl",
                        localSettings.protocol === protocol ? "bg-primary/10" : "bg-surface",
                        pressed && "opacity-70"
                      )}
                      style={{
                        borderWidth: localSettings.protocol === protocol ? 2 : 0,
                        borderColor: colors.primary,
                      }}
                    >
                      <View
                        className={cn(
                          "w-5 h-5 rounded-full border-2 items-center justify-center",
                          localSettings.protocol === protocol
                            ? "border-primary bg-primary"
                            : "border-muted"
                        )}
                      >
                        {localSettings.protocol === protocol && (
                          <Text className="text-white text-xs">✓</Text>
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground capitalize">
                          {protocol}
                        </Text>
                        <Text className="text-xs text-muted mt-1">
                          {protocol === "openvpn"
                            ? "Protocolo de código aberto confiável"
                            : "Protocolo moderno e rápido"}
                        </Text>
                      </View>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Security Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Segurança</Text>

            {/* Kill Switch */}
            <View className="flex-row items-center justify-between p-4 bg-surface rounded-2xl">
              <View className="flex-1 gap-1">
                <Text className="text-base font-semibold text-foreground">Kill Switch</Text>
                <Text className="text-xs text-muted">
                  Desconecta da internet se a VPN cair
                </Text>
              </View>
              <Switch
                value={localSettings.killSwitch}
                onValueChange={(value) => handleToggleSetting("killSwitch", value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={localSettings.killSwitch ? colors.success : colors.muted}
              />
            </View>

            {/* Split Tunneling */}
            <View className="flex-row items-center justify-between p-4 bg-surface rounded-2xl">
              <View className="flex-1 gap-1">
                <Text className="text-base font-semibold text-foreground">Split Tunneling</Text>
                <Text className="text-xs text-muted">
                  Alguns apps usam conexão direta
                </Text>
              </View>
              <Switch
                value={localSettings.splitTunneling}
                onValueChange={(value) => handleToggleSetting("splitTunneling", value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={localSettings.splitTunneling ? colors.success : colors.muted}
              />
            </View>
          </View>

          {/* Connection Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Conexão</Text>

            {/* Auto Connect */}
            <View className="flex-row items-center justify-between p-4 bg-surface rounded-2xl">
              <View className="flex-1 gap-1">
                <Text className="text-base font-semibold text-foreground">Conectar Automaticamente</Text>
                <Text className="text-xs text-muted">
                  Conecta ao iniciar o dispositivo
                </Text>
              </View>
              <Switch
                value={localSettings.autoConnect}
                onValueChange={(value) => handleToggleSetting("autoConnect", value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={localSettings.autoConnect ? colors.success : colors.muted}
              />
            </View>
          </View>

          {/* About Section */}
          <View className="gap-3 pt-4 border-t border-border">
            <Text className="text-lg font-semibold text-foreground">Sobre</Text>

            <View className="gap-3">
              <View className="flex-row items-center justify-between p-4 bg-surface rounded-2xl">
                <Text className="text-sm text-muted">Versão</Text>
                <Text className="text-sm font-semibold text-foreground">1.0.0</Text>
              </View>

              <View className="flex-row items-center justify-between p-4 bg-surface rounded-2xl">
                <Text className="text-sm text-muted">Encriptação</Text>
                <Text className="text-sm font-semibold text-foreground">AES-256</Text>
              </View>

              <View className="flex-row items-center justify-between p-4 bg-surface rounded-2xl">
                <Text className="text-sm text-muted">Protocolo</Text>
                <Text className="text-sm font-semibold text-foreground capitalize">
                  {localSettings.protocol}
                </Text>
              </View>
            </View>
          </View>

          {/* Info Text */}
          <View className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
            <Text className="text-xs text-foreground leading-relaxed">
              Angola VPN protege seus dados com encriptação de nível militar. Seus dados nunca são
              registrados ou compartilhados com terceiros.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

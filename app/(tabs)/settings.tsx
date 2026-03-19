import { ScrollView, Text, View, Pressable, Image, Linking, Switch } from "react-native";
import { useEffect, useState } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useVPN } from "@/hooks/use-vpn";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";
import { ANGOLA_VPN_SERVERS } from "@/lib/vpn-servers";
import { VPNLogger } from "@/lib/vpn-logger";

export default function SettingsScreen() {
  const colors = useColors();
  const { settings, updateSettings } = useVPN();
  const [localSettings, setLocalSettings] = useState(settings);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleToggleSetting = async (key: string, value: boolean) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    await updateSettings(updated);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleClearLogs = async () => {
    await VPNLogger.clearLogs();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleOpenUrl = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Erro ao abrir URL:", err)
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getOperatorSocialMedia = (operator: string) => {
    const servers = ANGOLA_VPN_SERVERS.filter((s) => s.operator === operator);
    return servers[0]?.socialMedia;
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-8">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Configurações</Text>
            <Text className="text-sm text-muted">Personalize sua experiência VPN</Text>
          </View>

          {/* VPN Settings */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Segurança VPN</Text>

            {/* Kill Switch */}
            <View className="flex-row items-center justify-between p-4 bg-surface rounded-xl">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">Kill Switch</Text>
                <Text className="text-xs text-muted mt-1">
                  Bloqueia tráfego se a VPN cair
                </Text>
              </View>
              <Switch
                value={localSettings.killSwitch}
                onValueChange={(value) => handleToggleSetting("killSwitch", value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={localSettings.killSwitch ? colors.primary : colors.muted}
              />
            </View>

            {/* Auto Connect */}
            <View className="flex-row items-center justify-between p-4 bg-surface rounded-xl">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">Conectar Automaticamente</Text>
                <Text className="text-xs text-muted mt-1">
                  Conectar VPN ao abrir o app
                </Text>
              </View>
              <Switch
                value={localSettings.autoConnect}
                onValueChange={(value) => handleToggleSetting("autoConnect", value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={localSettings.autoConnect ? colors.primary : colors.muted}
              />
            </View>

            {/* Split Tunneling */}
            <View className="flex-row items-center justify-between p-4 bg-surface rounded-xl">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">Split Tunneling</Text>
                <Text className="text-xs text-muted mt-1">
                  Escolher apps que usam VPN
                </Text>
              </View>
              <Switch
                value={localSettings.splitTunneling}
                onValueChange={(value) => handleToggleSetting("splitTunneling", value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={localSettings.splitTunneling ? colors.primary : colors.muted}
              />
            </View>
          </View>

          {/* Operadores - Redes Sociais */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Operadores</Text>

            {/* Unitel */}
            <View className="bg-surface rounded-xl p-4 gap-3">
              <View className="flex-row items-center gap-3">
                <Image
                  source={{
                    uri: "https://d2xsxph8kpxj0f.cloudfront.net/310519663447126234/DRwRQefuFkw3P3fNqNh9Ah/unitel-logo-FKuS2KDV7UtHmyK4uW3YLk.webp",
                  }}
                  className="w-12 h-12 rounded"
                />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Unitel</Text>
                  <Text className="text-xs text-muted">Maior operadora de Angola</Text>
                </View>
              </View>

              <View className="flex-row gap-2">
                {getOperatorSocialMedia("Unitel")?.website && (
                  <Pressable
                    onPress={() =>
                      handleOpenUrl(getOperatorSocialMedia("Unitel")?.website || "")
                    }
                    className="flex-1"
                  >
                    {({ pressed }) => (
                      <View
                        className={cn(
                          "bg-primary/10 rounded-lg py-2 items-center",
                          pressed && "opacity-70"
                        )}
                      >
                        <Text className="text-xs font-semibold text-primary">Website</Text>
                      </View>
                    )}
                  </Pressable>
                )}
                {getOperatorSocialMedia("Unitel")?.facebook && (
                  <Pressable
                    onPress={() =>
                      handleOpenUrl(getOperatorSocialMedia("Unitel")?.facebook || "")
                    }
                    className="flex-1"
                  >
                    {({ pressed }) => (
                      <View
                        className={cn(
                          "bg-blue-500/10 rounded-lg py-2 items-center",
                          pressed && "opacity-70"
                        )}
                      >
                        <Text className="text-xs font-semibold text-blue-500">Facebook</Text>
                      </View>
                    )}
                  </Pressable>
                )}
                {getOperatorSocialMedia("Unitel")?.instagram && (
                  <Pressable
                    onPress={() =>
                      handleOpenUrl(getOperatorSocialMedia("Unitel")?.instagram || "")
                    }
                    className="flex-1"
                  >
                    {({ pressed }) => (
                      <View
                        className={cn(
                          "bg-pink-500/10 rounded-lg py-2 items-center",
                          pressed && "opacity-70"
                        )}
                      >
                        <Text className="text-xs font-semibold text-pink-500">Instagram</Text>
                      </View>
                    )}
                  </Pressable>
                )}
              </View>
            </View>

            {/* Africell */}
            <View className="bg-surface rounded-xl p-4 gap-3">
              <View className="flex-row items-center gap-3">
                <Image
                  source={{
                    uri: "https://d2xsxph8kpxj0f.cloudfront.net/310519663447126234/DRwRQefuFkw3P3fNqNh9Ah/africell-logo-AeSwrR2XM8CzVk9WAatNL9.webp",
                  }}
                  className="w-12 h-12 rounded"
                />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Africell</Text>
                  <Text className="text-xs text-muted">Operadora de telecomunicações</Text>
                </View>
              </View>

              <View className="flex-row gap-2">
                {getOperatorSocialMedia("Africell")?.website && (
                  <Pressable
                    onPress={() =>
                      handleOpenUrl(getOperatorSocialMedia("Africell")?.website || "")
                    }
                    className="flex-1"
                  >
                    {({ pressed }) => (
                      <View
                        className={cn(
                          "bg-primary/10 rounded-lg py-2 items-center",
                          pressed && "opacity-70"
                        )}
                      >
                        <Text className="text-xs font-semibold text-primary">Website</Text>
                      </View>
                    )}
                  </Pressable>
                )}
                {getOperatorSocialMedia("Africell")?.facebook && (
                  <Pressable
                    onPress={() =>
                      handleOpenUrl(getOperatorSocialMedia("Africell")?.facebook || "")
                    }
                    className="flex-1"
                  >
                    {({ pressed }) => (
                      <View
                        className={cn(
                          "bg-blue-500/10 rounded-lg py-2 items-center",
                          pressed && "opacity-70"
                        )}
                      >
                        <Text className="text-xs font-semibold text-blue-500">Facebook</Text>
                      </View>
                    )}
                  </Pressable>
                )}
                {getOperatorSocialMedia("Africell")?.instagram && (
                  <Pressable
                    onPress={() =>
                      handleOpenUrl(getOperatorSocialMedia("Africell")?.instagram || "")
                    }
                    className="flex-1"
                  >
                    {({ pressed }) => (
                      <View
                        className={cn(
                          "bg-pink-500/10 rounded-lg py-2 items-center",
                          pressed && "opacity-70"
                        )}
                      >
                        <Text className="text-xs font-semibold text-pink-500">Instagram</Text>
                      </View>
                    )}
                  </Pressable>
                )}
              </View>
            </View>
          </View>

          {/* Logs */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">Logs de Conexão</Text>
              <Pressable
                onPress={() => setShowLogs(!showLogs)}
                className="flex-1"
              >
                {({ pressed }) => (
                  <Text
                    className={cn(
                      "text-xs font-semibold text-primary",
                      pressed && "opacity-70"
                    )}
                  >
                    {showLogs ? "Ocultar" : "Mostrar"}
                  </Text>
                )}
              </Pressable>
            </View>

            {showLogs && (
              <View className="bg-surface rounded-xl p-4 gap-2">
                <Text className="text-xs text-muted mb-2">
                  Histórico detalhado de todas as conexões VPN
                </Text>
                <Pressable
                  onPress={handleClearLogs}
                  className="flex-1"
                >
                  {({ pressed }) => (
                    <View
                      className={cn(
                        "bg-error/10 rounded-lg py-2 items-center",
                        pressed && "opacity-70"
                      )}
                    >
                      <Text className="text-xs font-semibold text-error">Limpar Logs</Text>
                    </View>
                  )}
                </Pressable>
              </View>
            )}
          </View>

          {/* About */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Sobre</Text>
            <View className="bg-surface rounded-xl p-4 gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Versão:</Text>
                <Text className="text-sm font-semibold text-foreground">1.0.0</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Desenvolvedor:</Text>
                <Text className="text-sm font-semibold text-foreground">Manus Team</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">País:</Text>
                <Text className="text-sm font-semibold text-foreground">Angola 🇦🇴</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

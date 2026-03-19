import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";

import { usePermissions } from "@/hooks/use-permissions";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

export function PermissionsRequest() {
  const colors = useColors();
  const { permissions, loading, requestPermissions, checkPermissions } =
    usePermissions();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const handleRequestPermissions = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const granted = await requestPermissions();

    if (granted) {
      setShowModal(false);
    }
  };

  const allPermissionsGranted =
    permissions.notifications && permissions.location;

  if (allPermissionsGranted) {
    return null;
  }

  return (
    <Modal
      visible={showModal || !allPermissionsGranted}
      transparent
      animationType="fade"
    >
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="bg-background rounded-3xl p-6 w-full max-w-sm">
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View className="gap-4">
              {/* Header */}
              <View className="gap-2">
                <Text className="text-2xl font-bold text-foreground">
                  Permissões Necessárias
                </Text>
                <Text className="text-sm text-muted">
                  Muaco VPN precisa de algumas permissões para funcionar
                  corretamente
                </Text>
              </View>

              {/* Permissions List */}
              <View className="gap-3">
                {/* Notifications */}
                <View className="flex-row items-start gap-3 p-3 bg-surface rounded-xl">
                  <Text className="text-xl">🔔</Text>
                  <View className="flex-1 gap-1">
                    <Text className="text-sm font-semibold text-foreground">
                      Notificações
                    </Text>
                    <Text className="text-xs text-muted">
                      Para alertá-lo sobre status da VPN
                    </Text>
                    <View className="mt-2 flex-row items-center gap-2">
                      <View
                        className={cn(
                          "w-2 h-2 rounded-full",
                          permissions.notifications
                            ? "bg-success"
                            : "bg-warning"
                        )}
                      />
                      <Text className="text-xs text-muted">
                        {permissions.notifications ? "Concedida" : "Pendente"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Location */}
                <View className="flex-row items-start gap-3 p-3 bg-surface rounded-xl">
                  <Text className="text-xl">📍</Text>
                  <View className="flex-1 gap-1">
                    <Text className="text-sm font-semibold text-foreground">
                      Localização
                    </Text>
                    <Text className="text-xs text-muted">
                      Para otimizar seleção de servidores
                    </Text>
                    <View className="mt-2 flex-row items-center gap-2">
                      <View
                        className={cn(
                          "w-2 h-2 rounded-full",
                          permissions.location ? "bg-success" : "bg-warning"
                        )}
                      />
                      <Text className="text-xs text-muted">
                        {permissions.location ? "Concedida" : "Pendente"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* VPN */}
                <View className="flex-row items-start gap-3 p-3 bg-surface rounded-xl">
                  <Text className="text-xl">🔐</Text>
                  <View className="flex-1 gap-1">
                    <Text className="text-sm font-semibold text-foreground">
                      Acesso VPN
                    </Text>
                    <Text className="text-xs text-muted">
                      Para gerenciar conexões VPN
                    </Text>
                    <View className="mt-2 flex-row items-center gap-2">
                      <View className="w-2 h-2 rounded-full bg-success" />
                      <Text className="text-xs text-muted">Concedida</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Info */}
              <View className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                <Text className="text-xs text-foreground leading-relaxed">
                  Suas permissões são respeitadas. Você pode alterar essas
                  configurações a qualquer momento nas Configurações do
                  dispositivo.
                </Text>
              </View>

              {/* Buttons */}
              <View className="gap-2 pt-2">
                <Pressable
                  onPress={handleRequestPermissions}
                  disabled={loading}
                  className="flex-1"
                >
                  {({ pressed }) => (
                    <View
                      className={cn(
                        "bg-primary rounded-xl py-3 items-center",
                        pressed && "opacity-80",
                        loading && "opacity-50"
                      )}
                    >
                      <Text className="text-white font-semibold">
                        {loading ? "Solicitando..." : "Conceder Permissões"}
                      </Text>
                    </View>
                  )}
                </Pressable>

                {allPermissionsGranted && (
                  <Pressable
                    onPress={() => setShowModal(false)}
                    className="flex-1"
                  >
                    {({ pressed }) => (
                      <View
                        className={cn(
                          "bg-surface rounded-xl py-3 items-center",
                          pressed && "opacity-70"
                        )}
                      >
                        <Text className="text-foreground font-semibold">
                          Continuar
                        </Text>
                      </View>
                    )}
                  </Pressable>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

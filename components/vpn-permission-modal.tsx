import { View, Text, Pressable, Modal } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface VPNPermissionModalProps {
  visible: boolean;
  onAllow: () => void;
  onDeny: () => void;
  serverName: string;
}

export function VPNPermissionModal({
  visible,
  onAllow,
  onDeny,
  serverName,
}: VPNPermissionModalProps) {
  const colors = useColors();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-background rounded-2xl p-6 gap-4 w-full max-w-sm">
          <Text className="text-xl font-bold text-foreground">Permissão de VPN</Text>

          <View className="bg-primary/10 rounded-xl p-4 gap-2">
            <Text className="text-sm font-bold text-foreground">
              Muaco VPN quer criar uma conexão VPN
            </Text>
            <Text className="text-xs text-muted">
              Servidor: {serverName}
            </Text>
            <Text className="text-xs text-muted mt-2">
              A VPN será gerenciada por Muaco VPN e funcionará mesmo sem tráfego de internet.
            </Text>
          </View>

          <View className="gap-2">
            <Pressable onPress={onAllow}>
              {({ pressed }) => (
                <View
                  className="bg-primary rounded-lg py-3 items-center"
                  style={{ opacity: pressed ? 0.8 : 1 }}
                >
                  <Text className="text-white font-bold">Permitir</Text>
                </View>
              )}
            </Pressable>

            <Pressable onPress={onDeny}>
              {({ pressed }) => (
                <View
                  className="bg-surface border border-border rounded-lg py-3 items-center"
                  style={{ opacity: pressed ? 0.8 : 1 }}
                >
                  <Text className="text-foreground font-bold">Negar</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

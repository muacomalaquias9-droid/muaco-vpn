import { ScrollView, Text, View, Pressable, Switch } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useSplitTunneling } from "@/hooks/use-split-tunneling";
import * as Haptics from "expo-haptics";

export default function SplitTunnelingScreen() {
  const colors = useColors();
  const {
    splitTunnelingEnabled,
    toggleSplitTunneling,
    availableApps,
    toggleAppBypass,
    getBypassedAppsCount,
  } = useSplitTunneling();

  const handleToggleSplitTunneling = async (value: boolean) => {
    await toggleSplitTunneling(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleToggleApp = async (packageName: string, bypass: boolean) => {
    await toggleAppBypass(packageName, !bypass);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          <View>
            <Text className="text-3xl font-bold text-foreground">Split Tunneling</Text>
            <Text className="text-xs text-muted">Escolha quais apps usam VPN</Text>
          </View>

          {/* Toggle Principal */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-sm font-bold text-foreground">Split Tunneling</Text>
                <Text className="text-xs text-muted">Gerenciar apps individuais</Text>
              </View>
              <Switch
                value={splitTunnelingEnabled}
                onValueChange={handleToggleSplitTunneling}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={splitTunnelingEnabled ? colors.primary : colors.muted}
              />
            </View>
            {splitTunnelingEnabled && (
              <Text className="text-xs text-success bg-success/10 p-2 rounded">
                ✓ Split Tunneling ativo: {getBypassedAppsCount()} app(s) excluído(s) da VPN
              </Text>
            )}
          </View>

          {/* Info */}
          {splitTunnelingEnabled && (
            <View className="bg-primary/10 rounded-xl p-4 border border-primary/20 gap-2">
              <Text className="text-xs font-bold text-foreground">Como funciona:</Text>
              <Text className="text-xs text-muted">
                • Apps marcados com ✓ usarão sua conexão normal (fora da VPN)
              </Text>
              <Text className="text-xs text-muted">
                • Outros apps continuarão usando a VPN normalmente
              </Text>
            </View>
          )}

          {/* Lista de Apps */}
          {splitTunnelingEnabled && (
            <View className="gap-3">
              <Text className="text-sm font-bold text-foreground">Apps Disponíveis</Text>
              {availableApps.map((app) => (
                <Pressable
                  key={app.packageName}
                  onPress={() => handleToggleApp(app.packageName, app.bypassVPN)}
                >
                  {({ pressed }) => (
                    <View
                      className={`flex-row items-center justify-between p-3 rounded-xl border ${
                        app.bypassVPN
                          ? "bg-primary/10 border-primary"
                          : "bg-surface border-border"
                      }`}
                      style={{ opacity: pressed ? 0.7 : 1 }}
                    >
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-foreground">
                          {app.appName}
                        </Text>
                        <Text className="text-xs text-muted">{app.packageName}</Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        {app.bypassVPN && (
                          <Text className="text-xs text-primary font-bold">Fora da VPN</Text>
                        )}
                        <Switch
                          value={app.bypassVPN}
                          onValueChange={() =>
                            handleToggleApp(app.packageName, app.bypassVPN)
                          }
                          trackColor={{ false: colors.border, true: colors.primary }}
                          thumbColor={app.bypassVPN ? colors.primary : colors.muted}
                        />
                      </View>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          )}

          {!splitTunnelingEnabled && (
            <View className="bg-surface rounded-xl p-4 border border-border">
              <Text className="text-xs text-muted text-center">
                Ative Split Tunneling para gerenciar quais apps usam a VPN
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

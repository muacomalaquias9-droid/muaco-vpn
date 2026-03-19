import { ScrollView, Text, View, Pressable, FlatList, ActivityIndicator, TextInput } from "react-native";
import { useEffect, useState } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useVPN } from "@/hooks/use-vpn";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";
import { VPNServer } from "@/lib/types";

export default function ServersScreen() {
  const colors = useColors();
  const { servers, connection, loading, connect, toggleFavorite, fetchServers } = useVPN();
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<"ping" | "speed" | "country">("ping");

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  const filteredServers = servers
    .filter((server) =>
      server.country.toLowerCase().includes(searchText.toLowerCase()) ||
      server.countryCode.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "ping":
          return (a.ping || 999) - (b.ping || 999);
        case "speed":
          return (b.speed || 0) - (a.speed || 0);
        case "country":
          return a.country.localeCompare(b.country);
        default:
          return 0;
      }
    });

  const handleSelectServer = async (server: VPNServer) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await connect(server);
    } catch (error) {
      console.error("Erro ao conectar ao servidor:", error);
    }
  };

  const renderServerItem = ({ item }: { item: VPNServer }) => {
    const isConnected = connection.server?.id === item.id && connection.status === "connected";

    return (
      <Pressable
        onPress={() => handleSelectServer(item)}
        className="mb-3"
      >
        {({ pressed }) => (
          <View
            className={cn(
              "flex-row items-center gap-4 p-4 rounded-2xl",
              isConnected ? "bg-primary/10" : "bg-surface",
              pressed && "opacity-70"
            )}
            style={{
              borderWidth: isConnected ? 2 : 0,
              borderColor: colors.primary,
            }}
          >
            {/* Flag */}
            <Text className="text-3xl">{getFlagEmoji(item.countryCode)}</Text>

            {/* Server Info */}
            <View className="flex-1 gap-1">
              <Text className="text-base font-semibold text-foreground">
                {item.country}
              </Text>
              <Text className="text-xs text-muted">{item.ip}</Text>
            </View>

            {/* Stats */}
            <View className="items-end gap-1">
              <View className="flex-row gap-2 items-center">
                <Text className="text-xs text-muted">📡</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {item.ping}ms
                </Text>
              </View>
              <View className="flex-row gap-2 items-center">
                <Text className="text-xs text-muted">⚡</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {item.speed}Mbps
                </Text>
              </View>
            </View>

            {/* Favorite Button */}
            <Pressable
              onPress={() => toggleFavorite(item.id)}
              className="ml-2"
            >
              <Text className="text-xl">
                {item.isFavorite ? "❤️" : "🤍"}
              </Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <ScreenContainer className="p-6">
      {/* Header */}
      <View className="gap-4 mb-6">
        <Text className="text-3xl font-bold text-foreground">Servidores VPN</Text>

        {/* Search Bar */}
        <View className="flex-row items-center gap-2 bg-surface rounded-2xl px-4 py-3">
          <Text className="text-xl">🔍</Text>
          <TextInput
            placeholder="Buscar país..."
            placeholderTextColor={colors.muted}
            value={searchText}
            onChangeText={setSearchText}
            className="flex-1 text-foreground"
            style={{ color: colors.foreground }}
          />
        </View>

        {/* Sort Options */}
        <View className="flex-row gap-2">
          {(["ping", "speed", "country"] as const).map((option) => (
            <Pressable
              key={option}
              onPress={() => setSortBy(option)}
              className="flex-1"
            >
              {({ pressed }) => (
                <View
                  className={cn(
                    "py-2 px-3 rounded-lg items-center",
                    sortBy === option ? "bg-primary" : "bg-surface",
                    pressed && "opacity-70"
                  )}
                >
                  <Text
                    className={cn(
                      "text-xs font-semibold capitalize",
                      sortBy === option ? "text-white" : "text-foreground"
                    )}
                  >
                    {option === "ping" && "Ping"}
                    {option === "speed" && "Velocidade"}
                    {option === "country" && "País"}
                  </Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </View>

      {/* Servers List */}
      {loading && servers.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted mt-4">Carregando servidores...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredServers}
          renderItem={renderServerItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-8">
              <Text className="text-muted">Nenhum servidor encontrado</Text>
            </View>
          }
        />
      )}

      {/* Server Count */}
      <View className="mt-6 pt-4 border-t border-border">
        <Text className="text-xs text-muted text-center">
          {filteredServers.length} servidor{filteredServers.length !== 1 ? "es" : ""} disponível{filteredServers.length !== 1 ? "is" : ""}
        </Text>
      </View>
    </ScreenContainer>
  );
}

/**
 * Converter código de país para emoji de bandeira
 */
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

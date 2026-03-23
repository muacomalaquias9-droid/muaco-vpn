import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Easing,
  Switch,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@/lib/theme-premium';
import { useAutoServerSelection } from '@/hooks/use-auto-server-selection';

// VPN Servers Angola
const VPN_SERVERS = [
  {
    id: 'unitel-net',
    name: 'Unitel NET',
    country: 'Angola',
    flag: '🇦🇴',
    protocol: 'OpenVPN UDP 1194',
    ping: '12ms',
    speed: '95 Mbps',
    logo: '🏢',
  },
  {
    id: 'africell-01',
    name: 'Africell 01',
    country: 'Angola',
    flag: '🇦🇴',
    protocol: 'OpenVPN UDP 1194',
    ping: '18ms',
    speed: '87 Mbps',
    logo: '🏢',
  },
  {
    id: 'africell-02',
    name: 'Africell 02',
    country: 'Angola',
    flag: '🇦🇴',
    protocol: 'OpenVPN TCP 443',
    ping: '22ms',
    speed: '78 Mbps',
    logo: '🏢',
  },
];

export default function HomeScreen() {
  const { suggestedServer, isLoading: geoLoading } = useAutoServerSelection();
  const [isConnected, setIsConnected] = useState(false);
  const [selectedServer, setSelectedServer] = useState(VPN_SERVERS[0]);

  // Usar servidor sugerido automaticamente
  useEffect(() => {
    if (suggestedServer) {
      const server = VPN_SERVERS.find(s => s.id === suggestedServer.id);
      if (server) {
        setSelectedServer(server);
      }
    }
  }, [suggestedServer]);
  const [vpnKey, setVpnKey] = useState('');
  const [killSwitch, setKillSwitch] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [showVPNPermission, setShowVPNPermission] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [stats, setStats] = useState({
    connectionTime: '0s',
    dataUsed: '0 MB',
    speed: '0 Mbps',
  });

  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  // Pulse animation para botão conectado
  useEffect(() => {
    if (isConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isConnected, pulseAnim]);

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });



  // Gerar chave VPN
  const generateVPNKey = () => {
    const key = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
    setVpnKey(key.toUpperCase());
    return key;
  };

  // Conectar VPN
  const handleConnect = async () => {
    if (!selectedServer) {
      alert('Selecione um servidor primeiro');
      return;
    }

    setShowVPNPermission(true);
  };

  const confirmVPNConnection = async () => {
    setShowVPNPermission(false);
    
    // Gerar chave VPN
    const key = generateVPNKey();
    
    // Simular conexão com delay de 5 segundos
    setTimeout(() => {
      setIsConnected(true);
      
      // Enviar notificação push
      Notifications.scheduleNotificationAsync({
        content: {
          title: '🔒 VPN Conectada',
          body: `Conectado ao servidor ${selectedServer.name}`,
          data: { status: 'connected' },
        },
        trigger: null,
      });

      // Atualizar estatísticas
      setStats({
        connectionTime: '0s',
        dataUsed: '0 MB',
        speed: selectedServer.speed,
      });

      // Salvar no AsyncStorage
      AsyncStorage.setItem('vpn_connected', 'true');
      AsyncStorage.setItem('vpn_server', selectedServer.id);
      AsyncStorage.setItem('vpn_key', key);
    }, 5000);
  };

  // Desconectar VPN
  const handleDisconnect = () => {
    setIsConnected(false);
    setVpnKey('');

    // Enviar notificação push
    Notifications.scheduleNotificationAsync({
      content: {
        title: '🔓 VPN Desconectada',
        body: 'Sua conexão VPN foi encerrada',
        data: { status: 'disconnected' },
      },
      trigger: null,
    });

    // Limpar AsyncStorage
    AsyncStorage.removeItem('vpn_connected');
    AsyncStorage.removeItem('vpn_key');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Muaco VPN</Text>
          <Text style={styles.headerSubtitle}>Apenas Angola 🇦🇴</Text>
          {location && (
            <Text style={styles.locationText}>
              📍 {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
            </Text>
          )}
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>STATUS</Text>
            <View style={[styles.statusBadge, isConnected && styles.statusBadgeConnected]}>
              <Text style={styles.statusBadgeText}>
                {isConnected ? '✓ Conectado' : '✕ Desconectado'}
              </Text>
            </View>
          </View>
          
          {isConnected && vpnKey && (
            <View style={styles.keyContainer}>
              <Text style={styles.keyLabel}>🔑 Chave VPN Ativa</Text>
              <Text style={styles.keyValue}>{vpnKey}</Text>
            </View>
          )}
        </View>

        {/* VPN Toggle Button - CAMADA SUPERIOR */}
        <View style={styles.toggleContainer}>
          <Animated.View
            style={[
              styles.pulseRing,
              isConnected && {
                transform: [{ scale }],
                opacity,
              },
            ]}
          />
          
          <TouchableOpacity
            style={[
              styles.toggleButton,
              isConnected && styles.toggleButtonConnected,
            ]}
            onPress={isConnected ? handleDisconnect : handleConnect}
            activeOpacity={0.8}
          >
            <Text style={styles.toggleIcon}>
              {isConnected ? '🔒' : '🔓'}
            </Text>
            <Text style={styles.toggleText}>
              {isConnected ? 'Desconectar' : 'Conectar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Servidor Selecionado */}
        <View style={styles.serverCard}>
          <Text style={styles.serverCardTitle}>Servidor Selecionado</Text>
          <TouchableOpacity
            style={styles.serverCardContent}
            onPress={() => setShowServerModal(true)}
          >
            <Text style={styles.serverCardName}>{selectedServer.name}</Text>
            <Text style={styles.serverCardProtocol}>{selectedServer.protocol}</Text>
            <Text style={styles.serverCardPing}>Ping: {selectedServer.ping}</Text>
          </TouchableOpacity>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Tempo</Text>
            <Text style={styles.statValue}>{stats.connectionTime}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Dados</Text>
            <Text style={styles.statValue}>{stats.dataUsed}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Velocidade</Text>
            <Text style={styles.statValue}>{stats.speed}</Text>
          </View>
        </View>

        {/* Kill Switch */}
        <View style={styles.killSwitchContainer}>
          <View style={styles.killSwitchLabel}>
            <Text style={styles.killSwitchTitle}>⚡ Kill Switch</Text>
            <Text style={styles.killSwitchDesc}>Bloqueia tráfego se VPN cair</Text>
          </View>
          <Switch
            value={killSwitch}
            onValueChange={setKillSwitch}
            trackColor={{ false: COLORS.bgTertiary, true: COLORS.success }}
            thumbColor={killSwitch ? COLORS.white : COLORS.gray400}
          />
        </View>
      </ScrollView>

      {/* Modal - Selecionar Servidor */}
      <Modal
        visible={showServerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowServerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Servidor</Text>
              <TouchableOpacity onPress={() => setShowServerModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={VPN_SERVERS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.serverItem,
                    selectedServer.id === item.id && styles.serverItemActive,
                  ]}
                  onPress={() => {
                    setSelectedServer(item);
                    setShowServerModal(false);
                  }}
                >
                  <View style={styles.serverItemContent}>
                    <Text style={styles.serverItemName}>{item.name}</Text>
                    <Text style={styles.serverItemMeta}>{item.protocol}</Text>
                    <Text style={styles.serverItemSpeed}>Ping: {item.ping}</Text>
                  </View>
                  {selectedServer.id === item.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              scrollEnabled={false}
            />
          </View>
        </View>
      </Modal>

      {/* Modal - Permissão VPN */}
      <Modal
        visible={showVPNPermission}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVPNPermission(false)}
      >
        <View style={styles.permissionOverlay}>
          <View style={styles.permissionContent}>
            <Text style={styles.permissionIcon}>🔐</Text>
            <Text style={styles.permissionTitle}>Permissão VPN</Text>
            <Text style={styles.permissionDesc}>
              Muaco VPN precisa de permissão para gerenciar a conexão VPN do seu dispositivo.
            </Text>

            <TouchableOpacity
              style={styles.permissionButton}
              onPress={confirmVPNConnection}
            >
              <Text style={styles.permissionButtonText}>Conceder Permissão</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.permissionButtonSecondary}
              onPress={() => setShowVPNPermission(false)}
            >
              <Text style={styles.permissionButtonSecondaryText}>Depois</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgSecondary,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.h2,
    fontWeight: '700' as any,
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    color: COLORS.gray400,
    marginTop: SPACING.xs,
  },
  locationText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
  statusCard: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.lg,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.bgTertiary,
    ...SHADOWS.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.gray400,
    fontWeight: '600' as any,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.danger,
    borderRadius: BORDER_RADIUS.full,
  },
  statusBadgeConnected: {
    backgroundColor: COLORS.success,
  },
  statusBadgeText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.white,
    fontWeight: '700' as any,
  },
  keyContainer: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.bgTertiary,
  },
  keyLabel: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.gray400,
    fontWeight: '600' as any,
    marginBottom: SPACING.sm,
  },
  keyValue: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.primary,
    fontWeight: '700' as any,
    fontFamily: 'monospace',
  },
  toggleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  pulseRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.success,
    opacity: 0.3,
  },
  toggleButton: {
    width: 160,
    height: 160,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.xl,
    zIndex: 10,
  },
  toggleButtonConnected: {
    backgroundColor: COLORS.success,
  },
  toggleIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  toggleText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: '700' as any,
    color: COLORS.white,
  },
  serverCard: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.bgTertiary,
    ...SHADOWS.md,
  },
  serverCardTitle: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.gray400,
    fontWeight: '600' as any,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  serverCardContent: {
    paddingVertical: SPACING.sm,
  },
  serverCardName: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: '700' as any,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  serverCardProtocol: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.gray400,
    marginBottom: SPACING.xs,
  },
  serverCardPing: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.success,
    fontWeight: '600' as any,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.lg,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.bgTertiary,
    ...SHADOWS.sm,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.gray400,
    fontWeight: '500' as any,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.h4,
    fontWeight: '700' as any,
    color: COLORS.primary,
  },
  killSwitchContainer: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.lg,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.bgTertiary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  killSwitchLabel: {
    flex: 1,
  },
  killSwitchTitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: '700' as any,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  killSwitchDesc: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.gray400,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bgSecondary,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: COLORS.bgTertiary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.h3,
    fontWeight: '700' as any,
    color: COLORS.white,
  },
  modalClose: {
    fontSize: 24,
    color: COLORS.gray400,
  },
  serverItem: {
    backgroundColor: COLORS.bgTertiary,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.bgTertiary,
  },
  serverItemActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  serverItemContent: {
    flex: 1,
  },
  serverItemName: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: '700' as any,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  serverItemMeta: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.gray400,
    marginBottom: SPACING.xs,
  },
  serverItemSpeed: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.success,
  },
  checkmark: {
    fontSize: 24,
    color: COLORS.primary,
  },
  permissionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.bgTertiary,
    width: '85%',
    ...SHADOWS.xl,
  },
  permissionIcon: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  permissionTitle: {
    fontSize: TYPOGRAPHY.sizes.h3,
    fontWeight: '700' as any,
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  permissionDesc: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.gray400,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  permissionButtonText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: '700' as any,
    color: COLORS.white,
  },
  permissionButtonSecondary: {
    backgroundColor: COLORS.bgTertiary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.bgTertiary,
  },
  permissionButtonSecondaryText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: '600' as any,
    color: COLORS.gray400,
  },
});

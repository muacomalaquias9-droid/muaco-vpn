import { useState, useCallback } from "react";
import * as Permissions from "expo-permissions";
import { Platform } from "react-native";

export interface PermissionStatus {
  camera: boolean;
  location: boolean;
  notifications: boolean;
  vpn: boolean;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: false,
    location: false,
    notifications: false,
    vpn: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const checkPermissions = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      if (Platform.OS === "android") {
        // Verificar permissões de notificações
        const notificationStatus = await Permissions.getAsync(
          Permissions.NOTIFICATIONS
        );

        // Verificar permissões de localização
        const locationStatus = await Permissions.getAsync(
          Permissions.LOCATION
        );

        setPermissions({
          camera: true,
          location: locationStatus.granted,
          notifications: notificationStatus.granted,
          vpn: true, // VPN é solicitada implicitamente
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao verificar permissões");
    } finally {
      setLoading(false);
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      if (Platform.OS === "android") {
        // Solicitar permissões de notificações
        const notificationResult = await Permissions.askAsync(
          Permissions.NOTIFICATIONS
        );

        // Solicitar permissões de localização
        const locationResult = await Permissions.askAsync(
          Permissions.LOCATION
        );

        setPermissions({
          camera: true,
          location: locationResult.granted,
          notifications: notificationResult.granted,
          vpn: true,
        });

        return (
          notificationResult.granted &&
          locationResult.granted
        );
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao solicitar permissões");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const result = await Permissions.askAsync(Permissions.NOTIFICATIONS);

      setPermissions((prev) => ({
        ...prev,
        notifications: result.granted,
      }));

      return result.granted;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao solicitar permissão de notificações");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestLocationPermission = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const result = await Permissions.askAsync(Permissions.LOCATION);

      setPermissions((prev) => ({
        ...prev,
        location: result.granted,
      }));

      return result.granted;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao solicitar permissão de localização");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    permissions,
    loading,
    error,
    checkPermissions,
    requestPermissions,
    requestNotificationPermission,
    requestLocationPermission,
  };
}

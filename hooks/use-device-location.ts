import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { Platform } from "react-native";

export interface DeviceLocation {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  accuracy: number;
  altitude: number;
  timestamp: number;
}

export function useDeviceLocation() {
  const [location, setLocation] = useState<DeviceLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;

    const getLocation = async () => {
      try {
        setIsLoading(true);
        
        // Solicitar permissão de localização
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permissão de localização negada");
          setIsLoading(false);
          return;
        }

        // Obter localização atual
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        // Obter informações de endereço
        const address = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        const locationData: DeviceLocation = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          city: address[0]?.city || "Desconhecida",
          country: address[0]?.country || "Desconhecida",
          accuracy: currentLocation.coords.accuracy || 0,
          altitude: currentLocation.coords.altitude || 0,
          timestamp: currentLocation.timestamp,
        };

        setLocation(locationData);
        setError(null);
      } catch (e: any) {
        console.log("Erro ao obter localização:", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    getLocation();

    // Atualizar localização a cada 30 segundos
    const interval = setInterval(getLocation, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    location,
    isLoading,
    error,
  };
}

import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ServerLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

// Coordenadas dos servidores de Angola
const SERVERS_LOCATIONS: ServerLocation[] = [
  {
    id: 'unitel-net',
    name: 'Unitel NET',
    latitude: -8.8383,
    longitude: 13.2344, // Luanda
  },
  {
    id: 'africell-01',
    name: 'Africell 01',
    latitude: -8.8383,
    longitude: 13.2344, // Luanda
  },
  {
    id: 'africell-02',
    name: 'Africell 02',
    latitude: -8.8383,
    longitude: 13.2344, // Luanda
  },
];

// Calcular distância entre dois pontos (Haversine formula)
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const useAutoServerSelection = () => {
  const [userLocation, setUserLocation] = useState<any>(null);
  const [suggestedServer, setSuggestedServer] = useState<ServerLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Obter localização do usuário e sugerir servidor
  useEffect(() => {
    const getLocationAndSuggestServer = async () => {
      try {
        setIsLoading(true);

        // Solicitar permissão de localização
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permissão de localização negada');
          setIsLoading(false);
          return;
        }

        // Obter localização atual
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setUserLocation(location.coords);

        // Calcular servidor mais próximo
        let closestServer = SERVERS_LOCATIONS[0];
        let minDistance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          closestServer.latitude,
          closestServer.longitude
        );

        for (const server of SERVERS_LOCATIONS) {
          const distance = calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            server.latitude,
            server.longitude
          );

          if (distance < minDistance) {
            minDistance = distance;
            closestServer = server;
          }
        }

        setSuggestedServer(closestServer);

        // Salvar no AsyncStorage
        await AsyncStorage.setItem('suggested_server', closestServer.id);
      } catch (error) {
        console.error('Erro ao obter localização:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getLocationAndSuggestServer();
  }, []);

  return {
    userLocation,
    suggestedServer,
    isLoading,
  };
};

import { useEffect, useState } from "react";
import * as Location from "expo-location";

export function useLocationPermission() {
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermissionGranted(status === "granted");
      if (status === "granted") {
        getCurrentLocation();
      }
    } catch (error) {
      console.error("Erro ao verificar permissão de localização:", error);
    }
  };

  const requestLocationPermission = async () => {
    setIsRequesting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionGranted(status === "granted");
      if (status === "granted") {
        getCurrentLocation();
      }
    } catch (error) {
      console.error("Erro ao solicitar permissão de localização:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error("Erro ao obter localização:", error);
    }
  };

  return {
    locationPermissionGranted,
    requestLocationPermission,
    isRequesting,
    userLocation,
    getCurrentLocation,
  };
}

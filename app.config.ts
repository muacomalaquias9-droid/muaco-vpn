import type { ExpoConfig } from "expo/config";

// Definir NODE_ENV se não estiver definido
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
}

const config: ExpoConfig = {
  name: "Muaco VPN",
  slug: "muaco-vpn",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "muacovpn",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.muacovpn.app",
    infoPlist: {
      NSLocalNetworkUsageDescription: "Muaco VPN precisa acessar a rede local",
      NSBonjourServiceTypes: ["_vpn._tcp"],
      NSLocationWhenInUseUsageDescription: "Localização para selecionar servidor mais próximo",
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#0066CC",
      foregroundImage: "./assets/images/android-icon-foreground.png",
    },
    package: "com.muacovpn.app",
    permissions: [
      "INTERNET",
      "ACCESS_NETWORK_STATE",
      "ACCESS_WIFI_STATE",
      "CHANGE_NETWORK_STATE",
      "BIND_VPN_SERVICE",
      "FOREGROUND_SERVICE",
      "WAKE_LOCK",
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "POST_NOTIFICATIONS",
      "RECEIVE_BOOT_COMPLETED",
      "CHANGE_WIFI_STATE",
      "MODIFY_PHONE_STATE",
    ],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "muacovpn",
            host: "*",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          minSdkVersion: 24,
          targetSdkVersion: 35,
          compileSdkVersion: 36,
          buildToolsVersion: "36.0.0",
        },
      },
    ],
  ],

};

export default config;

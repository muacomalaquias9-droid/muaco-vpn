import type { ExpoConfig } from "expo/config";

const bundleId = "com.muacovpn.app";

const config: ExpoConfig = {
  name: "Muaco VPN",
  slug: "angola-vpn-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "muacovpn",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: bundleId,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#0066CC",
      foregroundImage: "./assets/images/android-icon-foreground.png",
    },
    package: bundleId,
    permissions: [
      "INTERNET",
      "ACCESS_NETWORK_STATE",
      "BIND_VPN_SERVICE",
      "FOREGROUND_SERVICE",
      "WAKE_LOCK",
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#0066CC",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;

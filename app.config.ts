// Load environment variables with proper priority (system > .env)
import "./scripts/load-env.js";
import type { ExpoConfig } from "expo/config";

// Bundle ID válido para Android e iOS
const bundleId = "com.muacovpn.app";
const timestamp = Date.now().toString().slice(-8);
const schemeFromBundleId = `muacovpn${timestamp}`;

const env = {
  // App branding - update these values directly (do not use env vars)
  appName: "Muaco VPN",
  appSlug: "angola-vpn-app",
  // S3 URL of the app logo - set this to the URL returned by generate_image when creating custom logo
  // Leave empty to use the default icon from assets/images/icon.png
  logoUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663447126234/DRwRQefuFkw3P3fNqNh9Ah/icon-WwwQwtqR3GUDw273gs3snU.png",
  scheme: schemeFromBundleId,
  iosBundleId: bundleId,
  androidPackage: bundleId,
  // VPN Configuration
  vpnProtocol: "openvpn",
  vpnPort: 1194,
  vpnEncryption: "AES-256",
};

const config: ExpoConfig = {
  name: env.appName,
  slug: env.appSlug,
  version: "1.0.0",
  runtimeVersion: "1.0.0",
  orientation: "portrait",
  primaryColor: "#0066CC",
  icon: "./assets/images/icon.png",
  scheme: env.scheme,
  userInterfaceStyle: "automatic",
  description: "Muaco VPN - Aplicação VPN segura para proteger seus dados em Angola e outros países. Conexão rápida, servidores confiáveis e encriptação de nível militar.",
  newArchEnabled: true,
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: env.iosBundleId,
    infoPlist: {
      NSLocalNetworkUsageDescription: "Muaco VPN precisa acessar sua rede local para gerenciar conexões VPN.",
      NSBonjourServices: ["_vpn._tcp"],
      NSNetServiceBrowser: true,
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#0066CC",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: env.androidPackage,
    permissions: [
      "POST_NOTIFICATIONS",
      "INTERNET",
      "ACCESS_NETWORK_STATE",
      "ACCESS_WIFI_STATE",
      "CHANGE_NETWORK_STATE",
      "BIND_VPN_SERVICE",
      "FOREGROUND_SERVICE",
      "FOREGROUND_SERVICE_CONNECTED_DEVICE",
      "WAKE_LOCK",
      "RECEIVE_BOOT_COMPLETED",
      "VIBRATE",
      "READ_PHONE_STATE",
      "REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
    ],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: env.scheme,
            host: "*",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
      {
        action: "android.net.vpn.BIND_VPN_SERVICE",
        category: ["android.intent.category.DEFAULT"],
      },
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
    backgroundColor: "#0066CC",
  },
  plugins: [
    "expo-router",
    [
      "expo-audio",
      {
        microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone.",
      },
    ],
    [
      "expo-video",
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#0066CC",
        dark: {
          backgroundColor: "#0F1419",
        },
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          buildArchs: ["armeabi-v7a", "arm64-v8a"],
          minSdkVersion: 24,
          targetSdkVersion: 34,
          compileSdkVersion: 34,
          usesCleartextTraffic: true,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
    tsconfigPaths: true,
  },
};

// Export configuration with VPN-specific settings
export default config;

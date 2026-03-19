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
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: env.scheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
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
      "INTERNET",
      "ACCESS_NETWORK_STATE",
      "BIND_VPN_SERVICE",
      "FOREGROUND_SERVICE",
      "WAKE_LOCK",
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
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
};

// Export configuration with VPN-specific settings
export default config;

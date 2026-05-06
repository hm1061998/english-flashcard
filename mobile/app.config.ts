import { ExpoConfig, ConfigContext } from "expo/config";
import "dotenv/config"; // Nạp các biến từ file .env
import pkg from "./package.json"; // Đọc version từ package.json

export default ({ config }: ConfigContext): ExpoConfig => {
  const projectId = "3dbaf31b-2ab6-409d-9eba-a41ed40f1858";
  const env = process.env.EXPO_PUBLIC_ENV || "development";
  const isProd = env === "production";

  const appName = isProd ? "English Flashcard" : `Flashcard (${env})`;
  const bundleIdentifier = isProd
    ? "com.yourname.englishflashcard"
    : `com.yourname.englishflashcard.${env}`;

  return {
    ...config,
    name: appName,
    slug: "english-flashcard",
    // Tự động lấy version từ package.json. Môi trường khác prod sẽ gắn thêm hậu tố.
    version: isProd ? pkg.version : `${pkg.version}-${env}`,
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: bundleIdentifier,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: bundleIdentifier,
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },
    updates: {
      url: `https://u.expo.dev/${projectId}`,
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    plugins: [
      "expo-router",
      "expo-sqlite",
      "expo-web-browser",
      "expo-secure-store",
      "expo-font",
    ],
    extra: {
      env: env,
      apiUrl: process.env.EXPO_PUBLIC_API_URL, // Truyền biến môi trường vào extra
      eas: {
        projectId: projectId,
      },
    },
  };
};

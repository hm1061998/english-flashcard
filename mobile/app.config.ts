import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const env = process.env.EXPO_PUBLIC_ENV || "development";
  const isProd = env === "production";
  const isTest = env === "test";

  const appName = isProd ? "English Flashcard" : `Flashcard (${env})`;
  const bundleIdentifier = isProd
    ? "com.yourname.englishflashcard"
    : `com.yourname.englishflashcard.${env}`;

  return {
    ...config,
    name: appName,
    slug: "english-flashcard",
    version: "1.0.0",
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
    plugins: [
      "expo-router",
      "expo-sqlite",
      "expo-web-browser",
      "expo-secure-store",
    ],
    extra: {
      env: env,
      eas: {
        projectId: "3dbaf31b-2ab6-409d-9eba-a41ed40f1858", // Replace with actual PROJECT_ID from eas.json/cli
      },
    },
  };
};

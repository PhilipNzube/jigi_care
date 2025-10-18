import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { Colors, Sizes } from "../../../shared/constants";

const { width, height } = Dimensions.get("window");

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function AppSplashScreen({ navigation }) {
  useEffect(() => {
    // Simulate loading time (like checking user auth, loading data, etc.)
    const prepare = async () => {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        await SplashScreen.hideAsync();
        // Navigate to onboarding after splash
        navigation.replace("Onboarding");
      }
    };

    prepare();
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* This will be covered by the native splash screen */}
      <View style={styles.content}>
        <Text style={styles.appTitle}>JijiCare</Text>
        <Text style={styles.appSubtitle}>Your Health Companion</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  appTitle: {
    fontSize: 48,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: Sizes.sm,
    textAlign: "center",
  },
  appSubtitle: {
    fontSize: Sizes.fontSize.lg,
    color: Colors.textSecondary,
    textAlign: "center",
    fontWeight: "500",
  },
});

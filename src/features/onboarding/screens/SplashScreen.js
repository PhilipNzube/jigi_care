import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

const { width, height } = Dimensions.get("window");

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    // Auto navigate to onboarding after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace("Onboarding");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image source={Images.splashImg} style={styles.backgroundImage} />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* App Logo/Title */}
        <View style={styles.logoContainer}>
          <Text style={styles.appTitle}>JijiCare</Text>
          <Text style={styles.appSubtitle}>Your Health Companion</Text>
        </View>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDot} />
          <View style={styles.loadingDot} />
          <View style={styles.loadingDot} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  backgroundImage: {
    width: width,
    height: height,
    position: "absolute",
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Sizes.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Sizes.xxl,
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
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    marginHorizontal: 4,
    opacity: 0.6,
  },
});

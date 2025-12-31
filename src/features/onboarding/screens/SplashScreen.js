import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

const { width, height } = Dimensions.get("window");

export default function SplashScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Auto navigate to onboarding after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace("Onboarding");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Circular Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.circularLogo}>
          <Text style={styles.logoText}>JIGI CARE CONSULTING LTD</Text>
          <Text style={styles.logoSubtext}>
            HEALTH SOLUTIONS WITHOUT BORDERS
          </Text>
          <View style={styles.heartIcon}>
            <View style={styles.heartLeft} />
            <View style={styles.heartRight} />
            <View style={styles.ecgLine} />
          </View>
        </View>
      </View>

      {/* Loading Indicator */}
      <View style={styles.loadingContainer}>
        <View style={styles.loadingDot} />
        <View style={styles.loadingDot} />
        <View style={styles.loadingDot} />
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
    paddingHorizontal: Sizes.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Sizes.xxl,
  },
  circularLogo: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
    position: "relative",
  },
  logoText: {
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
    textAlign: "center",
    marginBottom: Sizes.xs,
    letterSpacing: 0.5,
  },
  logoSubtext: {
    fontSize: 8,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
    textAlign: "center",
    marginBottom: Sizes.sm,
    letterSpacing: 0.3,
  },
  heartIcon: {
    width: 40,
    height: 40,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  heartLeft: {
    position: "absolute",
    left: 0,
    width: 20,
    height: 20,
    backgroundColor: "#FF69B4",
    borderRadius: 10,
    transform: [{ rotate: "-45deg" }],
  },
  heartRight: {
    position: "absolute",
    right: 0,
    width: 20,
    height: 20,
    backgroundColor: "#4169E1",
    borderRadius: 10,
    transform: [{ rotate: "45deg" }],
  },
  ecgLine: {
    position: "absolute",
    width: 30,
    height: 2,
    backgroundColor: Colors.white,
    borderRadius: 1,
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

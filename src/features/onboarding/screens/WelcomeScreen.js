import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import Button from "../../../shared/components/Button";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const handleGetStarted = () => {
    navigation.navigate("SignUp");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image source={Images.onboarding4} style={styles.welcomeImage} />
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        <Text style={styles.welcomeTitle}>
          Welcome to <Text style={styles.appNameHighlight}>Jigicare</Text>
        </Text>
        <Text style={styles.welcomeDescription}>
          Your health journey begins right here, where every step you take leads
          you closer to a healthier life.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={[styles.actionContainer, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={styles.loginButton}
        >
          <Text style={styles.loginText}>Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  imageContainer: {
    flex: 0.6,
    width: "100%",
  },
  welcomeImage: {
    width: width,
    height: height * 0.6,
    resizeMode: "cover",
  },
  contentContainer: {
    flex: 0.4,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Sizes.xl,
    paddingTop: Sizes.xl,
  },
  welcomeTitle: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Sizes.lg,
    lineHeight: 40,
  },
  appNameHighlight: {
    color: Colors.primary,
  },
  welcomeDescription: {
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  actionContainer: {
    paddingHorizontal: Sizes.xl,
    paddingBottom: Sizes.xxl,
    paddingTop: Sizes.lg,
  },
  getStartedButton: {
    width: "100%",
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Sizes.md,
  },
  getStartedButtonText: {
    fontSize: Sizes.fontSize.lg,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
  },
  loginButton: {
    alignItems: "center",
    paddingVertical: Sizes.md,
  },
  loginText: {
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
  },
});

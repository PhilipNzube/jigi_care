import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import Button from "../../../shared/components/Button";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }) {
  const handleGetStarted = () => {
    navigation.replace("MainApp");
  };

  const handleLogin = () => {
    // Navigate to login screen (you can implement this later)
    console.log("Navigate to login");
  };

  return (
    <View style={styles.container}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image source={Images.onboarding4} style={styles.welcomeImage} />
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        <Text style={styles.welcomeTitle}>
          Welcome to <Text style={styles.appNameHighlight}>JijiCare</Text>
        </Text>
        <Text style={styles.welcomeDescription}>
          Your health journey begins right here, where every step you take leads
          you closer to a healthier life.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Button
          title="Get Started"
          variant="primary"
          size="lg"
          onPress={handleGetStarted}
          style={styles.getStartedButton}
        />

        <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
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
    paddingHorizontal: Sizes.xl,
  },
  imageContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Sizes.xxl,
  },
  welcomeImage: {
    width: width * 0.7,
    height: height * 0.3,
    resizeMode: "contain",
  },
  contentContainer: {
    flex: 0.3,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "bold",
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
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  actionContainer: {
    flex: 0.2,
    justifyContent: "center",
    paddingBottom: Sizes.xxl,
  },
  getStartedButton: {
    width: "100%",
    marginBottom: Sizes.lg,
  },
  loginButton: {
    alignItems: "center",
    paddingVertical: Sizes.md,
  },
  loginText: {
    fontSize: Sizes.fontSize.md,
    color: Colors.primary,
    fontWeight: "500",
  },
});

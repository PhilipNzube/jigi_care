import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

const { width, height } = Dimensions.get("window");

export default function CreateNewPasswordScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { email = "youremail@gmail.com" } = route.params || {};
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const spinValue = useRef(new Animated.Value(0)).current;

  const handleResetPassword = () => {
    setIsLoading(true);
    // Simulate password reset process
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate("Login");
    }, 2000);
  };

  const isFormValid =
    password && confirmPassword && password === confirmPassword;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>

            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image source={Images.appIcon} style={styles.appLogo} />
            </View>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            {/* Title */}
            <Text style={styles.title}>Create New Password</Text>

            {/* Description */}
            <Text style={styles.description}>
              We've sent a 6-digit code to {email}
            </Text>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.textSecondary}
                />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                placeholderTextColor={Colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.textSecondary}
                />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Confirm Password"
                placeholderTextColor={Colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Reset Password Button */}
            <TouchableOpacity
              style={[
                styles.resetButton,
                isFormValid && styles.resetButtonActive,
              ]}
              onPress={handleResetPassword}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <Animated.Image
                  source={Images.loader}
                  style={[
                    styles.loadingImage,
                    {
                      transform: [
                        {
                          rotate: spinValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0deg", "360deg"],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              ) : (
                <Text style={styles.resetButtonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Sizes.xl,
    paddingBottom: Sizes.xxl,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Sizes.lg,
    marginBottom: Sizes.xxl,
  },
  backButton: {
    position: "absolute",
    left: 0,
    zIndex: 1,
    padding: Sizes.sm,
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
  },
  appLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: Sizes.xxl,
  },
  title: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Sizes.md,
  },
  description: {
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: Sizes.xxl,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Sizes.xl,
    paddingVertical: Sizes.md,
  },
  inputIcon: {
    marginRight: Sizes.md,
  },
  textInput: {
    flex: 1,
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
  },
  eyeIcon: {
    padding: Sizes.sm,
  },
  resetButton: {
    width: "100%",
    height: 56,
    backgroundColor: Colors.primaryLight,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonActive: {
    backgroundColor: Colors.primary,
  },
  resetButtonText: {
    fontSize: Sizes.fontSize.lg,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
  },
  loadingImage: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
});

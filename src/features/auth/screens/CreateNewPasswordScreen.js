import React, { useState, useRef, useEffect } from "react";
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
import { verifyPasswordResetOTP } from "../services/authService";
import { showError, showSuccess } from "../../../shared/utils/toast";

const { width, height } = Dimensions.get("window");

export default function CreateNewPasswordScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { email = "youremail@gmail.com", otp } = route.params || {};
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      startSpinning();
    } else {
      stopSpinning();
    }
  }, [isLoading]);

  const startSpinning = () => {
    spinValue.setValue(0);
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopSpinning = () => {
    spinValue.stopAnimation();
  };

  // Validation functions
  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return (
      validatePassword(password) &&
      password === confirmPassword &&
      password.trim() !== "" &&
      confirmPassword.trim() !== ""
    );
  };

  // Real-time validation for individual fields
  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case "password":
        if (value.trim() === "") {
          newErrors.password = "Password is required";
        } else if (!validatePassword(value)) {
          newErrors.password = "Password must be at least 8 characters";
        } else {
          delete newErrors.password;
        }
        // Also validate confirm password if it has a value
        if (confirmPassword && confirmPassword !== value) {
          newErrors.confirmPassword = "Passwords do not match";
        } else if (confirmPassword && confirmPassword === value) {
          delete newErrors.confirmPassword;
        }
        break;
      case "confirmPassword":
        if (value.trim() === "") {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (value !== password) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    if (otp) {
      // If OTP is provided, verify it with the new password
      setIsLoading(true);
      try {
        await verifyPasswordResetOTP({
          OTP: parseInt(otp),
          password,
          email,
        });
        showSuccess("Password reset successfully!");
        navigation.navigate("Login");
      } catch (error) {
        console.error("❌ [PASSWORD RESET] Error resetting password:", error);
        if (error.statusCode === 400 && error.message?.includes("Invalid OTP")) {
          showError("Invalid OTP, please try again");
          // Navigate back to email verification
          navigation.goBack();
        } else if (error.isNetworkError) {
          showError("Network error. Please check your connection.");
        } else {
          showError(error.message || "Failed to reset password. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Fallback if OTP is not provided (shouldn't happen in normal flow)
      showError("OTP is required. Please go back and verify your email.");
    }
  };

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
              Please enter matching passwords with at least 8 characters
            </Text>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={errors.password ? Colors.error : Colors.textSecondary}
                />
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  errors.password && styles.textInputError,
                ]}
                placeholder="Password"
                placeholderTextColor={Colors.textSecondary}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  validateField("password", text);
                }}
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
            {(errors.password ||
              (password.trim() === "" && password.length > 0)) && (
              <Text style={styles.errorText}>
                {errors.password || "Password is required"}
              </Text>
            )}

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={
                    errors.confirmPassword ? Colors.error : Colors.textSecondary
                  }
                />
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  errors.confirmPassword && styles.textInputError,
                ]}
                placeholder="Confirm Password"
                placeholderTextColor={Colors.textSecondary}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  validateField("confirmPassword", text);
                }}
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
            {(errors.confirmPassword ||
              (confirmPassword.trim() === "" &&
                confirmPassword.length > 0)) && (
              <Text style={styles.errorText}>
                {errors.confirmPassword || "Please confirm your password"}
              </Text>
            )}

            {/* Reset Password Button */}
            <TouchableOpacity
              style={[
                styles.resetButton,
                isFormValid() && styles.resetButtonActive,
              ]}
              onPress={handleResetPassword}
              disabled={!isFormValid() || isLoading}
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

            {/* Help Text */}
            {/* {!isFormValid() && (
              <Text style={styles.helpText}>
                Please enter matching passwords with at least 8 characters
              </Text>
            )} */}
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
    left: -Sizes.sm,
    top: -Sizes.sm,
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
  textInputError: {
    color: Colors.error,
  },
  errorText: {
    fontSize: Sizes.fontSize.sm,
    fontFamily: "Poppins-Regular",
    color: Colors.error,
    marginTop: Sizes.xs,
    marginBottom: Sizes.sm,
  },
  helpText: {
    fontSize: Sizes.fontSize.sm,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Sizes.sm,
    marginBottom: Sizes.lg,
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
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
});

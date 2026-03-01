import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import { signIn as signInAPI } from "../services/authService";
import { useAuth } from "../../../shared/context/AuthContext";
import { getBiometricEnabled } from "../../../shared/utils/storage";
import LoadingOverlay from "../../../shared/components/LoadingOverlay";
import { showError, showSuccess } from "../../../shared/utils/toast";

const { width, height } = Dimensions.get("window");

export default function LockScreen() {
  const insets = useSafeAreaInsets();
  const { user, unlockApp, signOut } = useAuth();
  
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);

  const spinValue = useRef(new Animated.Value(0)).current;
  const isAuthenticating = useRef(false);

  useEffect(() => {
    checkBiometrics();
  }, []);

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

  const checkBiometrics = async () => {
    try {
      // First check if user actually enabled biometrics in settings
      const userEnabled = await getBiometricEnabled();
      if (!userEnabled) {
        setCanUseBiometrics(false);
        return;
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (hasHardware && isEnrolled) {
        setCanUseBiometrics(true);
        // Automatically prompt for biometric when screen appears
        handleBiometricUnlock();
      } else {
        setCanUseBiometrics(false);
      }
    } catch (err) {
      console.error("Error checking biometrics on lock screen:", err);
      setCanUseBiometrics(false);
    }
  };

  const handleBiometricUnlock = async () => {
    if (isAuthenticating.current) return;
    try {
      isAuthenticating.current = true;
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock Jigi Care",
        fallbackLabel: "Use Password",
        disableDeviceFallback: false,
      });

      if (result.success) {
        unlockApp();
      }
    } catch (err) {
      console.error("Biometric authentication error:", err);
    } finally {
      isAuthenticating.current = false;
    }
  };

  const handlePasswordUnlock = async () => {
    if (password.trim() === "") {
      setError("Please enter your password");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      if (!user?.email) {
        throw new Error("No user email found to validate password.");
      }

      // Re-authenticate silently to verify password
      await signInAPI({ email: user.email, password });
      
      // If success, unlock
      showSuccess("Unlocked!");
      unlockApp();
    } catch (err) {
      console.error("Unlock error:", err);
      // Let the user try again
      setError("Incorrect password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    signOut();
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
            <View style={styles.logoContainer}>
              <View style={styles.iconBackground}>
                <Ionicons name="lock-closed" size={40} color={Colors.primary} />
              </View>
            </View>

            <Text style={styles.title}>App Locked</Text>
            <Text style={styles.subtitle}>
              {user?.fullName ? `Welcome back, ${user.fullName.split(' ')[0]}` : "Welcome back"}
            </Text>
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons
                  name="key-outline"
                  size={20}
                  color={error ? Colors.error : Colors.textSecondary}
                />
              </View>
              <TextInput
                style={[styles.textInput, error && styles.textInputError]}
                placeholder="Enter Password"
                placeholderTextColor={Colors.textSecondary}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError(null);
                }}
                secureTextEntry={!showPassword}
                onSubmitEditing={handlePasswordUnlock}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            
            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.loginButton, password.length > 0 && styles.loginButtonActive]}
              onPress={handlePasswordUnlock}
              disabled={password.length === 0 || isLoading}
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
                <Text style={styles.loginButtonText}>Unlock</Text>
              )}
            </TouchableOpacity>

            {/* Biometric Option */}
            {canUseBiometrics && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricUnlock}
                disabled={isLoading}
              >
                <Ionicons name="finger-print" size={24} color={Colors.primary} />
                <Text style={styles.biometricButtonText}>Use Face ID / Fingerprint</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Not you? Log out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <LoadingOverlay visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    // Overlay style to sit on top
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 9999,
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
    alignItems: "center",
    marginTop: Sizes.xxl * 1.5,
    marginBottom: Sizes.xxl,
  },
  logoContainer: {
    marginBottom: Sizes.lg,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 152, 179, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  subtitle: {
    fontSize: Sizes.fontSize.lg,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
    textAlign: "center",
  },
  emailText: {
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Sizes.xs,
  },
  formContainer: {
    justifyContent: "center",
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
    marginTop: -Sizes.md,
    marginBottom: Sizes.md,
  },
  eyeIcon: {
    padding: Sizes.sm,
  },
  loginButton: {
    width: "100%",
    height: 56,
    backgroundColor: Colors.primaryLight,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Sizes.lg,
    marginTop: Sizes.md,
  },
  loginButtonActive: {
    backgroundColor: Colors.primary,
  },
  loginButtonText: {
    fontSize: Sizes.fontSize.lg,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
  },
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 56,
    backgroundColor: Colors.white,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Sizes.xxl,
  },
  biometricButtonText: {
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    marginLeft: Sizes.sm,
  },
  logoutButton: {
    alignItems: "center",
    marginTop: Sizes.xl,
  },
  logoutButtonText: {
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Medium",
    color: Colors.error,
  },
  loadingImage: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
});

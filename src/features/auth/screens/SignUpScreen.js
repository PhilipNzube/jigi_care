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
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import {
  signUp as signUpAPI,
  signUpWithGoogle,
  sendEmailVerificationOTP,
} from "../services/authService";
import { signInWithGoogle as googleSignIn } from "../services/googleSignInService";
import { useAuth } from "../../../shared/context/AuthContext";
import {
  GOOGLE_WEB_CLIENT_ID,
  isGoogleConfigured,
} from "../../../shared/config/googleConfig";
import LoadingOverlay from "../../../shared/components/LoadingOverlay";
import { showError, showSuccess } from "../../../shared/utils/toast";

const { width, height } = Dimensions.get("window");

export default function SignUpScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
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
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // Password requirements:
    // - At least 8 characters
    // - At least one uppercase letter
    // - At least one lowercase letter
    // - At least one number
    // - At least one special character
    if (password.length < 8) {
      return {
        valid: false,
        message: "Password must be at least 8 characters",
      };
    }
    if (!/[A-Z]/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one uppercase letter",
      };
    }
    if (!/[a-z]/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one lowercase letter",
      };
    }
    if (!/[0-9]/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one number",
      };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one special character",
      };
    }
    return { valid: true, message: "" };
  };

  const validateFullName = (name) => {
    return name.trim().length >= 2;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateFullName(fullName)) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.message;
      }
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Real-time validation for individual fields
  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case "fullName":
        if (value.trim() === "") {
          newErrors.fullName = "Full name is required";
        } else if (!validateFullName(value)) {
          newErrors.fullName = "Full name must be at least 2 characters";
        } else {
          delete newErrors.fullName;
        }
        break;
      case "email":
        if (value.trim() === "") {
          newErrors.email = "Email is required";
        } else if (!validateEmail(value)) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;
      case "password":
        if (value.trim() === "") {
          newErrors.password = "Password is required";
        } else {
          const passwordValidation = validatePassword(value);
          if (!passwordValidation.valid) {
            newErrors.password = passwordValidation.message;
          } else {
            delete newErrors.password;
          }
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

  const isFormValid = () => {
    const passwordValidation = validatePassword(password);
    return (
      validateFullName(fullName) &&
      validateEmail(email) &&
      passwordValidation.valid &&
      password === confirmPassword &&
      fullName.trim() !== "" &&
      email.trim() !== "" &&
      password.trim() !== "" &&
      confirmPassword.trim() !== ""
    );
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Send email verification OTP with email and fullName
      await sendEmailVerificationOTP(email, fullName);
      showSuccess("A one time password has been sent to your registered email");

      // Navigate to email verification screen with signup data
      navigation.navigate("EmailVerification", {
        email,
        from: "signup",
        signupData: {
          email,
          fullName,
          password,
          role: "patient",
        },
      });
    } catch (error) {
      console.error("❌ [SIGN UP SCREEN] Error sending OTP:", error);
      console.error(
        "❌ [SIGN UP SCREEN] Error details:",
        JSON.stringify(error, null, 2)
      );

      // Handle API errors
      if (error.isNetworkError) {
        showError("Network error. Please check your connection.");
      } else {
        showError("Unable to send verification code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);

    try {
      if (!isGoogleConfigured()) {
        console.warn("⚠️ [GOOGLE SIGN UP] Google Client ID not configured!");
        showError("Google Sign In is not configured. Please contact support.");
        setIsLoading(false);
        return;
      }

      console.log("🔵 [GOOGLE SIGN UP] Initiating Google authentication...");

      // On Android, add a small delay to ensure Activity context is ready
      // This is especially important after navigation/redirects
      if (Platform.OS === "android") {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Sign in with Google
      const googleUser = await googleSignIn(GOOGLE_WEB_CLIENT_ID);

      console.log("🔵 [GOOGLE SIGN UP] Google authentication successful!");
      console.log(
        "🔵 [GOOGLE SIGN UP] Google user data:",
        JSON.stringify(googleUser, null, 2)
      );

      // Send Google data to backend - only idToken and role needed for mobile-signin endpoint
      const response = await signUpWithGoogle({
        idToken: googleUser.idToken,
        role: "patient",
      });

      // Store authentication data
      await signUp(response);

      showSuccess("Google sign up successful! Welcome to Jigi Care.");

      // Navigate to main app
      navigation.replace("MainApp");
    } catch (error) {
      console.error("❌ [GOOGLE SIGN UP] Google sign up error:", error);
      console.error(
        "❌ [GOOGLE SIGN UP] Error details:",
        JSON.stringify(error, null, 2)
      );

      // Handle errors
      if (error.message?.includes("cancelled")) {
        // User cancelled, don't show error
        console.log("ℹ️ [GOOGLE SIGN UP] User cancelled Google sign in");
      } else if (error.isNetworkError) {
        showError("Network error. Please check your connection.");
      } else {
        showError("Unable to sign up with Google. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignUp = () => {
    // Handle Apple sign up
    console.log("Apple sign up");
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
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image source={Images.appIcon} style={styles.appLogo} />
            </View>

            {/* Title */}
            <Text style={styles.title}>Create an Account</Text>
            <Text style={styles.subtitle}>
              Sign up to book appointments, chat with doctors and more
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={errors.fullName ? Colors.error : Colors.textSecondary}
                />
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  errors.fullName && styles.textInputError,
                ]}
                placeholder="Full Name"
                placeholderTextColor={Colors.textSecondary}
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  validateField("fullName", text);
                }}
                autoCapitalize="words"
              />
            </View>
            {(errors.fullName ||
              (fullName.trim() === "" && fullName.length > 0)) && (
              <Text style={styles.errorText}>
                {errors.fullName || "Full name is required"}
              </Text>
            )}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={errors.email ? Colors.error : Colors.textSecondary}
                />
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  errors.email && styles.textInputError,
                ]}
                placeholder="Email"
                placeholderTextColor={Colors.textSecondary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  validateField("email", text);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {(errors.email || (email.trim() === "" && email.length > 0)) && (
              <Text style={styles.errorText}>
                {errors.email || "Email is required"}
              </Text>
            )}

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

            {/* Password Requirements */}
            {password.length > 0 && (
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>
                  Password must contain:
                </Text>
                <Text
                  style={[
                    styles.requirement,
                    password.length >= 8 && styles.requirementMet,
                  ]}
                >
                  • At least 8 characters
                </Text>
                <Text
                  style={[
                    styles.requirement,
                    /[A-Z]/.test(password) && styles.requirementMet,
                  ]}
                >
                  • At least one uppercase letter
                </Text>
                <Text
                  style={[
                    styles.requirement,
                    /[a-z]/.test(password) && styles.requirementMet,
                  ]}
                >
                  • At least one lowercase letter
                </Text>
                <Text
                  style={[
                    styles.requirement,
                    /[0-9]/.test(password) && styles.requirementMet,
                  ]}
                >
                  • At least one number
                </Text>
                <Text
                  style={[
                    styles.requirement,
                    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) &&
                      styles.requirementMet,
                  ]}
                >
                  • At least one special character
                </Text>
              </View>
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

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.signUpButton,
                isFormValid() && styles.signUpButtonActive,
              ]}
              onPress={handleSignUp}
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
                <Text style={styles.signUpButtonText}>Sign up</Text>
              )}
            </TouchableOpacity>

            {/* Help Text */}
            {!isFormValid() && (
              <Text style={styles.helpText}>
                Please fill in all fields correctly to continue
              </Text>
            )}

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Log in</Text>
              </TouchableOpacity>
            </View>

            {/* Separator */}
            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>or continue with</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Social Login Buttons */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignUp}
            >
              <Image source={Images.google} style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={styles.appleButton}
              onPress={handleAppleSignUp}
            >
              <Ionicons name="logo-apple" size={20} color={Colors.white} />
              <Text style={styles.appleButtonText}>Continue with Apple</Text>
            </TouchableOpacity> */}
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
    marginTop: Sizes.xxl,
    marginBottom: Sizes.xxl,
  },
  logoContainer: {
    marginBottom: Sizes.xl,
  },
  appLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Sizes.sm,
  },
  subtitle: {
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: Sizes.xxl,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Sizes.lg,
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
  requirementsContainer: {
    marginTop: Sizes.sm,
    marginBottom: Sizes.md,
    paddingLeft: Sizes.sm,
  },
  requirementsTitle: {
    fontSize: Sizes.fontSize.sm,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
    marginBottom: Sizes.xs,
  },
  requirement: {
    fontSize: Sizes.fontSize.xs,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    marginTop: Sizes.xs / 2,
  },
  requirementMet: {
    color: "#4CAF50",
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
  signUpButton: {
    width: "100%",
    height: 56,
    backgroundColor: Colors.primaryLight,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Sizes.lg,
    marginBottom: Sizes.lg,
  },
  signUpButtonActive: {
    backgroundColor: Colors.primary,
  },
  signUpButtonText: {
    fontSize: Sizes.fontSize.lg,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
  },
  loadingImage: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Sizes.xl,
  },
  loginText: {
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
    textDecorationLine: "underline",
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  separatorText: {
    fontSize: Sizes.fontSize.sm,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    marginHorizontal: Sizes.md,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 56,
    backgroundColor: Colors.white,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Sizes.md,
    paddingHorizontal: Sizes.lg,
  },
  googleIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  googleButtonText: {
    flex: 1,
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    textAlign: "center",
    marginLeft: -20, // Negative margin to center text (compensate for icon width)
  },
  appleButton: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 56,
    backgroundColor: Colors.black,
    borderRadius: 28,
    paddingHorizontal: Sizes.lg,
  },
  appleButtonText: {
    flex: 1,
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
    textAlign: "center",
    marginLeft: -20, // Negative margin to center text (compensate for icon width)
  },
});

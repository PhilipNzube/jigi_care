import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  BackHandler,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import { signIn as signInAPI, signInWithGoogle } from "../services/authService";
import { signInWithGoogle as googleSignIn } from "../services/googleSignInService";
import { useAuth } from "../../../shared/context/AuthContext";
import { getBiometricEnabled } from "../../../shared/utils/storage";
import {
  GOOGLE_WEB_CLIENT_ID,
  isGoogleConfigured,
} from "../../../shared/config/googleConfig";
import LoadingOverlay from "../../../shared/components/LoadingOverlay";
import { showError, showSuccess } from "../../../shared/utils/toast";

const { width, height } = Dimensions.get("window");

export default function LoginScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { signIn, token, unlockApp } = useAuth();
  const defaultMethod = route?.params?.defaultMethod ?? "password";
  // isLockedMode: true when this screen was opened due to auto-lock timeout
  const isLockedMode = !!route?.params?.defaultMethod;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState(defaultMethod);
  const [availableBiometrics, setAvailableBiometrics] = useState({
    face: false,
    fingerprint: false,
  });
  const [isBiometricActive, setIsBiometricActive] = useState(false);
  const [errors, setErrors] = useState({});

  const spinValue = useRef(new Animated.Value(0)).current;
  const isAuthenticating = useRef(false);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateLoginForm = () => {
    const newErrors = {};

    if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isLoginFormValid = () => {
    return (
      validateEmail(email) &&
      validatePassword(password) &&
      email.trim() !== "" &&
      password.trim() !== ""
    );
  };

  // Real-time validation for individual fields
  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
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
        } else if (!validatePassword(value)) {
          newErrors.password = "Password must be at least 6 characters";
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
  };

  useEffect(() => {
    checkAvailableBiometrics();
    
    // Show session timeout message if navigated via timeout
    if (route?.params?.timeout) {
      showError("Session timed out. Please log in again for your security.");
      // Clear the param to prevent repeated toasts on subsequent renders
      navigation.setParams({ timeout: undefined });
    }
  }, []);

  // Prevent Android back button from going back to MainApp when screen is in locked mode
  useEffect(() => {
    if (!isLockedMode) return;
    const onBackPress = () => {
      // If we're on a biometric view, go back to password view
      if (loginMethod !== "password") {
        setLoginMethod("password");
        return true; // handled
      }
      // If on password view, block back entirely (don't let them into the app)
      return true;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [isLockedMode, loginMethod]);

  // Auto-prompt biometrics whenever the user navigates to a biometric 'page'
  useEffect(() => {
    if (loginMethod === "face" || loginMethod === "fingerprint") {
      handleBiometricLogin(loginMethod, true);
    }
  }, [loginMethod]);

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

  const checkAvailableBiometrics = async () => {
    try {
      // If not in locked mode and no token, user is fully logged out — hide biometrics
      if (!isLockedMode && !token) {
        setAvailableBiometrics({ face: false, fingerprint: false });
        return;
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const userBiometricEnabled = await getBiometricEnabled();

      setIsBiometricActive(userBiometricEnabled);

      if (hasHardware && isEnrolled) {
        const canFace = supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
        const canFingerprint = supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);

        setAvailableBiometrics({
          face: canFace,
          fingerprint: canFingerprint,
        });

        // Automatically switch to biometric view if user enabled it
        if (userBiometricEnabled) {
          const defaultMethod = canFingerprint ? "fingerprint" : (canFace ? "face" : "password");
          if (defaultMethod !== "password") {
            setLoginMethod(defaultMethod);
            // the useEffect on loginMethod will auto-trigger the actual prompt
          }
        }
      }
    } catch (error) {
      console.error("Error checking biometrics:", error);
    }
  };

  const handleLogin = async () => {
    if (!validateLoginForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await signInAPI({ email, password });
      // Store authentication data and navigate
      await signIn(response);
      
      // Explicitly clear any lock modes
      if (unlockApp) await unlockApp();

      showSuccess("Login successful! Welcome back.");
      navigation.replace("MainApp");
    } catch (error) {
      console.error("❌ [LOGIN SCREEN] Login error:", error);
      console.error(
        "❌ [LOGIN SCREEN] Error details:",
        JSON.stringify(error, null, 2)
      );

      // Handle API errors
      if (error.statusCode === 401) {
        showError("Bad credentials. Please check your email and password.");
      } else if (error.isNetworkError) {
        showError("Network error. Please check your connection.");
      } else {
        showError("Unable to sign in. Please check your credentials and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      if (!isGoogleConfigured()) {
        console.warn("⚠️ [GOOGLE SIGN IN] Google Client ID not configured!");
        showError("Google Sign In is not configured. Please contact support.");
        setIsLoading(false);
        return;
      }

      console.log("🔵 [GOOGLE SIGN IN] Initiating Google authentication...");

      // On Android, add a small delay to ensure Activity context is ready
      // This is especially important after navigation/redirects
      if (Platform.OS === "android") {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Sign in with Google
      const googleUser = await googleSignIn(GOOGLE_WEB_CLIENT_ID);

      console.log("🔵 [GOOGLE SIGN IN] Google authentication successful!");
      console.log(
        "🔵 [GOOGLE SIGN IN] Google user data:",
        JSON.stringify(googleUser, null, 2)
      );

      // Send Google data to backend - only idToken and role needed for mobile-signin endpoint
      const response = await signInWithGoogle({
        idToken: googleUser.idToken,
        role: "patient",
      });

      // Store authentication data
      await signIn(response);

      // Explicitly clear any lock modes
      if (unlockApp) await unlockApp();

      showSuccess("Google sign in successful! Welcome back.");

      // Navigate to main app
      navigation.replace("MainApp");
    } catch (error) {
      console.error("❌ [GOOGLE SIGN IN] Google sign in error:", error);
      console.error(
        "❌ [GOOGLE SIGN IN] Error details:",
        JSON.stringify(error, null, 2)
      );

      // Handle errors
      if (error.message?.includes("cancelled")) {
        // User cancelled, don't show error
        console.log("ℹ️ [GOOGLE SIGN IN] User cancelled Google sign in");
      } else if (error.isNetworkError) {
        showError("Network error. Please check your connection.");
      } else {
        showError("Unable to sign in with Google. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async (method, isAutoPrompt = false) => {
    // Prevent multiple simultaneous authentication attempts
    if (isAuthenticating.current) {
      return;
    }

    try {
      isAuthenticating.current = true;

      // Check if biometric authentication is available
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        if (!isAutoPrompt) alert("Biometric authentication is not available on this device");
        return;
      }

      // Authenticate using biometrics — let the OS use the appropriate sensor
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage:
          method === "face"
            ? "Authenticate with Face ID"
            : "Authenticate with Fingerprint",
        fallbackLabel: "Use Password",
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Explicitly clear any lock modes
        if (unlockApp) await unlockApp();

        // On success, always navigate to main app (resets the stack cleanly)
        navigation.replace("MainApp");
      } else {
        // User cancelled or authentication failed
        console.log("Biometric authentication cancelled or failed");
      }
    } catch (error) {
      console.error("Biometric authentication error:", error);
      // Only show alert if it's not a cancellation error and not an activity error
      if (
        error.message &&
        !error.message.includes("cancelled") &&
        !error.message.includes("activity is no longer available")
      ) {
        alert("Biometric authentication failed. Please try again.");
      }
    } finally {
      isAuthenticating.current = false;
    }
  };

  const renderPasswordLogin = () => (
    <View style={styles.formContainer}>
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
          style={[styles.textInput, errors.email && styles.textInputError]}
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
        <Text
          style={styles.errorText}
          includeFontPadding={false}
          textAlignVertical="center"
          adjustsFontSizeToFit={true}
          minimumFontScale={0.85}
          numberOfLines={1}
        >
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
          style={[styles.textInput, errors.password && styles.textInputError]}
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
      {(errors.password || (password.trim() === "" && password.length > 0)) && (
        <Text
          style={styles.errorText}
          includeFontPadding={false}
          textAlignVertical="center"
          adjustsFontSizeToFit={true}
          minimumFontScale={0.85}
          numberOfLines={1}
        >
          {errors.password || "Password is required"}
        </Text>
      )}

      {/* Forgot Password */}
      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={() => navigation.navigate("ForgotPassword")}
      >
        <Text
          style={styles.forgotPasswordText}
          includeFontPadding={false}
          textAlignVertical="center"
          adjustsFontSizeToFit={true}
          minimumFontScale={0.85}
          numberOfLines={1}
        >
          Forgot Password?
        </Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={[
          styles.loginButton,
          isLoginFormValid() && styles.loginButtonActive,
        ]}
        onPress={handleLogin}
        disabled={!isLoginFormValid() || isLoading}
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
          <Text
            style={styles.loginButtonText}
            includeFontPadding={false}
            textAlignVertical="center"
            adjustsFontSizeToFit={true}
            minimumFontScale={0.85}
            numberOfLines={1}
          >
            Log in
          </Text>
        )}
      </TouchableOpacity>

      {/* Help Text */}
      {/* {!isLoginFormValid() && (
        <Text style={styles.helpText}>
          Please enter a valid email and password to continue
        </Text>
      )} */}

      {/* Sign Up Link */}
      <View style={styles.signUpContainer}>
        <Text
          style={styles.signUpText}
          includeFontPadding={false}
          textAlignVertical="center"
          adjustsFontSizeToFit={true}
          minimumFontScale={0.85}
          numberOfLines={1}
        >
          Don't have an account?{" "}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <Text
            style={styles.signUpLink}
            includeFontPadding={false}
            textAlignVertical="center"
            adjustsFontSizeToFit={true}
            minimumFontScale={0.85}
            numberOfLines={1}
          >
            Sign up
          </Text>
        </TouchableOpacity>
      </View>

      {/* Separator */}
      <View style={styles.separator}>
        <View style={styles.separatorLine} />
        <Text
          style={styles.separatorText}
          includeFontPadding={false}
          textAlignVertical="center"
          adjustsFontSizeToFit={true}
          minimumFontScale={0.85}
          numberOfLines={1}
        >
          or continue with
        </Text>
        <View style={styles.separatorLine} />
      </View>

      {/* Social Login Buttons */}
      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleSignIn}
        disabled={isLoading}
      >
        <Image source={Images.google} style={styles.googleIcon} />
        <Text
          style={styles.googleButtonText}
          includeFontPadding={false}
          textAlignVertical="center"
          adjustsFontSizeToFit={true}
          minimumFontScale={0.85}
          numberOfLines={1}
        >
          Continue with Google
        </Text>
      </TouchableOpacity>

      {/* Biometric Options - Only show if biometrics are explicitly active and token exists */}
      {isBiometricActive && (token || isLockedMode) && (
        <View style={styles.biometricOptions}>
          {/* {availableBiometrics.face && (
            <TouchableOpacity
              style={styles.biometricOption}
              onPress={() => setLoginMethod("face")}
            >
              <Text style={styles.biometricText}>
                Click to Log in with Face ID
              </Text>
            </TouchableOpacity>
          )} */}
          {availableBiometrics.fingerprint && (
            <TouchableOpacity
              style={styles.biometricOption}
              onPress={() => setLoginMethod("fingerprint")}
            >
              <Text
                style={styles.biometricText}
                includeFontPadding={false}
                textAlignVertical="center"
                adjustsFontSizeToFit={true}
                minimumFontScale={0.85}
                numberOfLines={1}
              >
                Click to Log in with Fingerprint
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderFaceIDLogin = () => (
    <View style={styles.biometricContainer}>
      {/* Face ID Icon */}
      <View style={styles.biometricIconContainer}>
        <Image
          source={Images.facialRecognition}
          style={styles.biometricImage}
        />
      </View>

      {/* Instruction Text */}
      <Text
        style={styles.biometricInstruction}
        includeFontPadding={false}
        textAlignVertical="center"
        adjustsFontSizeToFit={true}
        minimumFontScale={0.85}
        numberOfLines={2}
      >
        Click to log in with Face ID
      </Text>

      {/* Verify Button */}
      <TouchableOpacity
        style={styles.verifyButton}
        onPress={() => handleBiometricLogin("face")}
      >
        <Text
          style={styles.verifyButtonText}
          includeFontPadding={false}
          textAlignVertical="center"
          adjustsFontSizeToFit={true}
          minimumFontScale={0.85}
          numberOfLines={1}
        >
          Verify Face
        </Text>
      </TouchableOpacity>

      {/* Password Login Link */}
      <TouchableOpacity
        style={styles.alternativeLogin}
        onPress={() => setLoginMethod("password")}
      >
        <Text
          style={styles.alternativeLoginText}
          includeFontPadding={false}
          textAlignVertical="center"
          adjustsFontSizeToFit={true}
          minimumFontScale={0.85}
          numberOfLines={1}
        >
          Click to Log in with Password
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFingerprintLogin = () => (
    <View style={styles.biometricContainer}>
      {/* Fingerprint Icon */}
      <View style={styles.biometricIconContainer}>
        <Image source={Images.fingerPrint} style={styles.biometricImage} />
      </View>

      {/* Instruction Text */}
      <Text
        style={styles.biometricInstruction}
        includeFontPadding={false}
        textAlignVertical="center"
        adjustsFontSizeToFit={true}
        minimumFontScale={0.85}
        numberOfLines={2}
      >
        Click to log in with Fingerprint
      </Text>

      {/* Verify Button */}
      <TouchableOpacity
        style={styles.verifyButton}
        onPress={() => handleBiometricLogin("fingerprint")}
      >
        <Text
          style={styles.verifyButtonText}
          includeFontPadding={false}
          textAlignVertical="center"
          adjustsFontSizeToFit={true}
          minimumFontScale={0.85}
          numberOfLines={1}
        >
          Verify Fingerprint
        </Text>
      </TouchableOpacity>

      {/* Password Login Link */}
      <TouchableOpacity
        style={styles.alternativeLogin}
        onPress={() => setLoginMethod("password")}
      >
        <Text
          style={styles.alternativeLoginText}
          includeFontPadding={false}
          textAlignVertical="center"
          adjustsFontSizeToFit={true}
          minimumFontScale={0.85}
          numberOfLines={1}
        >
          Click to Log in with Password
        </Text>
      </TouchableOpacity>
    </View>
  );

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
            <Text
              style={styles.title}
              includeFontPadding={false}
              textAlignVertical="center"
              adjustsFontSizeToFit={true}
              minimumFontScale={0.85}
              numberOfLines={1}
            >
              Welcome Back
            </Text>
            <Text
              style={styles.subtitle}
              includeFontPadding={false}
              textAlignVertical="center"
              adjustsFontSizeToFit={true}
              minimumFontScale={0.85}
              numberOfLines={2}
            >
              Log in to continue your health journey
            </Text>
          </View>

          {/* Content */}
          {loginMethod === "password" && renderPasswordLogin()}
          {loginMethod === "face" && renderFaceIDLogin()}
          {loginMethod === "fingerprint" && renderFingerprintLogin()}
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
    marginBottom: Sizes.lg,
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
    marginBottom: Sizes.sm,
  },
  subtitle: {
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    textAlign: "center",
  },
  formContainer: {
    justifyContent: "center",
    minHeight: height * 0.5,
    paddingBottom: Sizes.xl,
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
  iconText: {
    fontSize: 20,
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: Sizes.xxl,
  },
  forgotPasswordText: {
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
  },
  loginButton: {
    width: "100%",
    height: 56,
    backgroundColor: Colors.primaryLight,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Sizes.lg,
  },
  loginButtonActive: {
    backgroundColor: Colors.primary,
  },
  loginButtonText: {
    fontSize: Sizes.fontSize.lg,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Sizes.xxl,
  },
  signUpText: {
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  signUpLink: {
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
  },
  forgotPasswordContainer: {
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  forgotPasswordLink: {
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
  biometricOptions: {
    alignItems: "center",
  },
  biometricOption: {
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  biometricText: {
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
  },
  biometricImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  biometricContainer: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: height * 0.5,
    paddingBottom: Sizes.xl,
  },
  biometricIconContainer: {
    marginBottom: Sizes.xxl,
    alignItems: "center",
  },
  biometricInstruction: {
    fontSize: Sizes.fontSize.lg,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Sizes.xxl,
  },
  verifyButton: {
    width: "100%",
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Sizes.xxl,
  },
  verifyButtonText: {
    fontSize: Sizes.fontSize.lg,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
  },
  alternativeLogin: {
    alignItems: "center",
  },
  alternativeLoginText: {
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
  },
  loadingImage: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
});

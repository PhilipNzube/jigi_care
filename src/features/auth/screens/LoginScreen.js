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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

const { width, height } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState("password"); // "password", "face", "fingerprint"
  const [availableBiometrics, setAvailableBiometrics] = useState({
    face: false,
    fingerprint: false,
  });

  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkAvailableBiometrics();
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

  const checkAvailableBiometrics = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (hasHardware && isEnrolled) {
        setAvailableBiometrics({
          face: supportedTypes.includes(
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
          ),
          fingerprint: supportedTypes.includes(
            LocalAuthentication.AuthenticationType.FINGERPRINT
          ),
        });
      }
    } catch (error) {
      console.error("Error checking biometrics:", error);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      navigation.replace("MainApp");
    }, 2000);
  };

  const handleBiometricLogin = async (method) => {
    try {
      // Authenticate using biometrics
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage:
          method === "face"
            ? "Authenticate with Face ID"
            : "Authenticate with Fingerprint",
        fallbackLabel: "Use Password",
      });

      if (result.success) {
        navigation.replace("MainApp");
      }
    } catch (error) {
      console.error("Biometric authentication error:", error);
      alert("Biometric authentication failed");
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
            color={Colors.textSecondary}
          />
        </View>
        <TextInput
          style={styles.textInput}
          placeholder="Email"
          placeholderTextColor={Colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

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

      {/* Forgot Password */}
      <TouchableOpacity style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={[
          styles.loginButton,
          email && password && styles.loginButtonActive,
        ]}
        onPress={handleLogin}
        disabled={!email || !password || isLoading}
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
          <Text style={styles.loginButtonText}>Log in</Text>
        )}
      </TouchableOpacity>

      {/* Sign Up Link */}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.signUpLink}>Sign up</Text>
        </TouchableOpacity>
      </View>

      {/* Forgot Password Link */}
      <TouchableOpacity 
        style={styles.forgotPasswordContainer}
        onPress={() => navigation.navigate("ForgotPassword")}
      >
        <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Biometric Options */}
      <View style={styles.biometricOptions}>
        {availableBiometrics.face && (
          <TouchableOpacity
            style={styles.biometricOption}
            onPress={() => setLoginMethod("face")}
          >
            <Text style={styles.biometricText}>
              Click to Log in with Face ID
            </Text>
          </TouchableOpacity>
        )}
        {availableBiometrics.fingerprint && (
          <TouchableOpacity
            style={styles.biometricOption}
            onPress={() => setLoginMethod("fingerprint")}
          >
            <Text style={styles.biometricText}>
              Click to Log in with Fingerprint
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
      <Text style={styles.biometricInstruction}>Click to log in with Face</Text>

      {/* Verify Button */}
      <TouchableOpacity
        style={styles.verifyButton}
        onPress={() => handleBiometricLogin("face")}
      >
        <Text style={styles.verifyButtonText}>Verify Face</Text>
      </TouchableOpacity>

      {/* Password Login Link */}
      <TouchableOpacity
        style={styles.alternativeLogin}
        onPress={() => setLoginMethod("password")}
      >
        <Text style={styles.alternativeLoginText}>
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
      <Text style={styles.biometricInstruction}>
        Click to log in with Fingerprint
      </Text>

      {/* Verify Button */}
      <TouchableOpacity
        style={styles.verifyButton}
        onPress={() => handleBiometricLogin("fingerprint")}
      >
        <Text style={styles.verifyButtonText}>Verify Fingerprint</Text>
      </TouchableOpacity>

      {/* Password Login Link */}
      <TouchableOpacity
        style={styles.alternativeLogin}
        onPress={() => setLoginMethod("password")}
      >
        <Text style={styles.alternativeLoginText}>
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Log in to continue your health journey
            </Text>
          </View>

          {/* Content */}
          {loginMethod === "password" && renderPasswordLogin()}
          {loginMethod === "face" && renderFaceIDLogin()}
          {loginMethod === "fingerprint" && renderFingerprintLogin()}
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
    width: 120,
    height: 120,
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
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
});

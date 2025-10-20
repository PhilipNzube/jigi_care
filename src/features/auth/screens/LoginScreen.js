import React, { useState } from "react";
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
      // Check if biometric authentication is available
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        alert("Biometric authentication is not available on this device");
        return;
      }

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
          <View style={styles.loadingDots}>
            <View style={styles.loadingDot} />
            <View style={styles.loadingDot} />
            <View style={styles.loadingDot} />
          </View>
        ) : (
          <Text style={styles.loginButtonText}>Log in</Text>
        )}
      </TouchableOpacity>

      {/* Sign Up Link */}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't have an account? </Text>
        <TouchableOpacity>
          <Text style={styles.signUpLink}>Sign up</Text>
        </TouchableOpacity>
      </View>

      {/* Biometric Option */}
      <TouchableOpacity
        style={styles.biometricOption}
        onPress={() => setLoginMethod("face")}
      >
        <Text style={styles.biometricText}>Click to Log in with Face ID</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFaceIDLogin = () => (
    <View style={styles.biometricContainer}>
      {/* Face ID Icon */}
      <View style={styles.biometricIconContainer}>
        <View style={styles.faceIdIcon}>
          <View style={styles.faceIdOutline}>
            <View style={styles.faceIdScanArea} />
          </View>
        </View>
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
        <View style={styles.fingerprintIcon}>
          <View style={styles.fingerprintOutline}>
            <View style={styles.fingerprintLines} />
          </View>
        </View>
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Sizes.xl,
    paddingBottom: Sizes.xxl,
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
    minHeight: height * 0.6,
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
  biometricOption: {
    alignItems: "center",
  },
  biometricText: {
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
  },
  biometricContainer: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: height * 0.6,
  },
  biometricIconContainer: {
    marginBottom: Sizes.xxl,
    alignItems: "center",
  },
  faceIdIcon: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  faceIdOutline: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  faceIdScanArea: {
    width: 80,
    height: 60,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    borderStyle: "dashed",
  },
  fingerprintIcon: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  fingerprintOutline: {
    width: 80,
    height: 100,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  fingerprintLines: {
    width: 60,
    height: 80,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 30,
    borderStyle: "dashed",
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
  loadingDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
    marginHorizontal: 2,
  },
});

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
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
import { OtpInput } from "react-native-otp-entry";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

const { width, height } = Dimensions.get("window");

export default function EmailVerificationScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { email = "youremail@gmail.com", from = "signup" } = route.params || {};
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(50);
  const [canResend, setCanResend] = useState(false);

  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
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

  const handleCodeChange = (text) => {
    setCode(text);
  };

  const handleVerifyCode = () => {
    setIsLoading(true);
    // Simulate verification process
    setTimeout(() => {
      setIsLoading(false);
      // Route based on where the verification was invoked from
      if (from === "forgotPassword") {
        navigation.navigate("CreateNewPassword", { email });
      } else {
        // Default to main app for signup flow
        navigation.replace("MainApp");
      }
    }, 2000);
  };

  const handleResendCode = () => {
    if (canResend) {
      setResendTimer(50);
      setCanResend(false);
      // Simulate resend process
    }
  };

  const isCodeComplete = code.length === 6;

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
            <Text style={styles.title}>
              {from === "forgotPassword"
                ? "Check your Email"
                : "Verify your Email"}
            </Text>

            {/* Description */}
            <Text style={styles.description}>
              {from === "forgotPassword"
                ? `We've sent a 6-digit code to ${email} to reset your password`
                : `We've sent a 6-digit code to ${email} to verify your account`}
            </Text>

            {/* Code Input Fields */}
            <View style={styles.codeContainer}>
              <OtpInput
                numberOfDigits={6}
                value={code}
                onTextChange={handleCodeChange}
                focusColor={Colors.primary}
                focusStickBlinkingDuration={500}
                textInputProps={{
                  accessibilityLabel: "One-Time Password",
                }}
                theme={{
                  containerStyle: styles.otpContainer,
                  pinCodeContainerStyle: styles.otpInput,
                  pinCodeTextStyle: styles.otpText,
                  focusStickStyle: styles.focusStick,
                  focusedPinCodeContainerStyle: styles.otpInputFocused,
                }}
              />
            </View>

            {/* Verify Code Button */}
            <TouchableOpacity
              style={[
                styles.verifyButton,
                isCodeComplete && styles.verifyButtonActive,
              ]}
              onPress={handleVerifyCode}
              disabled={!isCodeComplete || isLoading}
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
                <Text style={styles.verifyButtonText}>Verify Code</Text>
              )}
            </TouchableOpacity>

            {/* Secondary Actions */}
            <View style={styles.secondaryActions}>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>
                  Use another email
                </Text>
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>
                  Resend Code in {resendTimer}s{" "}
                </Text>
                <TouchableOpacity
                  onPress={handleResendCode}
                  disabled={!canResend}
                >
                  <Text
                    style={[
                      styles.resendLink,
                      !canResend && styles.resendLinkDisabled,
                    ]}
                  >
                    Resend
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
  codeContainer: {
    marginBottom: Sizes.xxl,
    alignItems: "center",
  },
  otpContainer: {
    width: "100%",
    justifyContent: "center",
  },
  otpInput: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.white,
    marginHorizontal: 8,
  },
  otpInputFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  otpText: {
    fontSize: Sizes.fontSize.lg,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
  },
  focusStick: {
    backgroundColor: Colors.primary,
    width: 2,
  },
  verifyButton: {
    width: "100%",
    height: 56,
    backgroundColor: Colors.primaryLight,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Sizes.xl,
  },
  verifyButtonActive: {
    backgroundColor: Colors.primary,
  },
  verifyButtonText: {
    fontSize: Sizes.fontSize.lg,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
  },
  loadingImage: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  secondaryActions: {
    alignItems: "center",
  },
  secondaryButton: {
    marginBottom: Sizes.lg,
  },
  secondaryButtonText: {
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
    textDecorationLine: "underline",
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  resendText: {
    fontSize: Sizes.fontSize.sm,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  resendLink: {
    fontSize: Sizes.fontSize.sm,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
    textDecorationLine: "underline",
  },
  resendLinkDisabled: {
    color: Colors.textSecondary,
    textDecorationLine: "none",
  },
});

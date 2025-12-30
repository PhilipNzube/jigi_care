import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import { verifyPasswordResetOTP } from "../../auth/services/authService";
import { showError, showSuccess } from "../../../shared/utils/toast";
import LoadingOverlay from "../../../shared/components/LoadingOverlay";

export default function ChangePasswordModal({ visible, onClose, otp, email }) {
  const insets = useSafeAreaInsets();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      spinValue.setValue(0);
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.stopAnimation();
    }
  }, [isLoading]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!newPassword.trim()) {
      newErrors.newPassword = "Password is required";
    } else {
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.valid) {
        newErrors.newPassword = passwordValidation.message;
      }
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    if (!isValid) {
      // Show first error message
      const firstError = Object.values(newErrors)[0];
      if (firstError) {
        showError(firstError);
      }
    }

    return isValid;
  };

  const handleSave = async () => {
    console.log("🔐 [CHANGE PASSWORD] Save button pressed");
    console.log("🔐 [CHANGE PASSWORD] OTP:", otp);
    console.log("🔐 [CHANGE PASSWORD] Email:", email);
    console.log(
      "🔐 [CHANGE PASSWORD] New Password length:",
      newPassword.length
    );
    console.log(
      "🔐 [CHANGE PASSWORD] Confirm Password length:",
      confirmPassword.length
    );

    if (!validateForm()) {
      console.log("❌ [CHANGE PASSWORD] Form validation failed");
      return;
    }

    if (!otp || !email) {
      console.log("❌ [CHANGE PASSWORD] Missing OTP or email");
      showError(
        "OTP verification required. Please go back and verify your email."
      );
      return;
    }

    setIsLoading(true);
    try {
      console.log("🔐 [CHANGE PASSWORD] Calling verifyPasswordResetOTP API...");
      await verifyPasswordResetOTP({
        OTP: parseInt(otp),
        password: newPassword,
        email,
      });
      console.log("✅ [CHANGE PASSWORD] Password changed successfully!");
      showSuccess("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
      onClose();
    } catch (error) {
      console.error("❌ [CHANGE PASSWORD] Error changing password:", error);
      console.error(
        "❌ [CHANGE PASSWORD] Error details:",
        JSON.stringify(error, null, 2)
      );
      if (error.statusCode === 400 && error.message?.includes("Invalid OTP")) {
        showError("Invalid OTP, please try again");
      } else if (error.isNetworkError) {
        showError("Network error. Please check your connection.");
      } else {
        showError(
          error.message || "Failed to change password. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />
        <View
          style={[
            styles.modal,
            { paddingBottom: Math.max(insets.bottom, Sizes.xl) },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.title}>CHANGE PASSWORD</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={styles.label}>New Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.newPassword && styles.inputContainerError,
                ]}
              >
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color={errors.newPassword ? Colors.error : Colors.grey}
                />
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (errors.newPassword) {
                      setErrors({ ...errors, newPassword: null });
                    }
                  }}
                  placeholder="Enter new password"
                  placeholderTextColor={Colors.grey}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off" : "eye"}
                    size={20}
                    color={Colors.grey}
                  />
                </TouchableOpacity>
              </View>
              {errors.newPassword && (
                <Text style={styles.errorText}>{errors.newPassword}</Text>
              )}
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>
                  Password must contain:
                </Text>
                <Text
                  style={[
                    styles.requirement,
                    newPassword.length >= 8 && styles.requirementMet,
                  ]}
                >
                  • At least 8 characters
                </Text>
                <Text
                  style={[
                    styles.requirement,
                    /[A-Z]/.test(newPassword) && styles.requirementMet,
                  ]}
                >
                  • At least one uppercase letter
                </Text>
                <Text
                  style={[
                    styles.requirement,
                    /[a-z]/.test(newPassword) && styles.requirementMet,
                  ]}
                >
                  • At least one lowercase letter
                </Text>
                <Text
                  style={[
                    styles.requirement,
                    /[0-9]/.test(newPassword) && styles.requirementMet,
                  ]}
                >
                  • At least one number
                </Text>
                <Text
                  style={[
                    styles.requirement,
                    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) &&
                      styles.requirementMet,
                  ]}
                >
                  • At least one special character
                </Text>
              </View>

              <Text style={[styles.label, { marginTop: Sizes.lg }]}>
                Confirm New Password
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.confirmPassword && styles.inputContainerError,
                ]}
              >
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color={errors.confirmPassword ? Colors.error : Colors.grey}
                />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: null });
                    }
                  }}
                  placeholder="Confirm new password"
                  placeholderTextColor={Colors.grey}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color={Colors.grey}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                isLoading && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={isLoading}
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
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      <LoadingOverlay visible={isLoading} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  overlayTouchable: {
    flex: 1,
  },
  modal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Sizes.lg,
    paddingHorizontal: Sizes.lg,
    paddingBottom: Sizes.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.grey,
  },
  closeButton: {
    padding: Sizes.xs,
  },
  content: {
    marginBottom: Sizes.lg,
  },
  label: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#999999",
    marginBottom: Sizes.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: Sizes.sm,
  },
  inputContainerError: {
    borderBottomColor: Colors.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    marginLeft: Sizes.sm,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.error,
    marginTop: Sizes.xs,
  },
  requirementsContainer: {
    marginTop: Sizes.md,
    marginBottom: Sizes.sm,
  },
  requirementsTitle: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
    marginBottom: Sizes.xs,
  },
  requirement: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    marginTop: Sizes.xs / 2,
  },
  requirementMet: {
    color: "#4CAF50",
  },
  saveButton: {
    backgroundColor: "#0098B3",
    paddingVertical: Sizes.md,
    borderRadius: 25,
    alignItems: "center",
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  loadingImage: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
});

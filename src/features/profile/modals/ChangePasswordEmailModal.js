import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import { useAuth } from "../../../shared/context/AuthContext";
import { sendPasswordResetOTP } from "../../auth/services/authService";
import { showError, showSuccess } from "../../../shared/utils/toast";
import LoadingOverlay from "../../../shared/components/LoadingOverlay";

export default function ChangePasswordEmailModal({ visible, onClose, onVerify }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email] = useState(user?.email || "");

  const handleVerify = async () => {
    if (!email) {
      showError("Email not found");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetOTP(email);
      showSuccess("A one time password has been sent to your registered email");
      onVerify(email);
    } catch (error) {
      console.error("❌ [CHANGE PASSWORD] Error sending OTP:", error);
      if (error.isNetworkError) {
        showError("Network error. Please check your connection.");
      } else {
        showError("Unable to send verification code. Please try again.");
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
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />
        <View
          style={[
            styles.modal,
            { paddingBottom: Math.max(insets.bottom, Sizes.xl) },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>CHANGE PASSWORD</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.grey} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.message}>
              Verification code will be sent to the email address provided
            </Text>
            <Text style={styles.emailText}>"{email}"</Text>
          </View>

          <TouchableOpacity 
            style={styles.verifyButton} 
            onPress={handleVerify}
            disabled={isLoading}
          >
            <Text style={styles.verifyButtonText}>Send Verification Code</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    alignItems: "center",
  },
  message: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    textAlign: "center",
    marginBottom: Sizes.sm,
  },
  emailText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#0098B3",
    textAlign: "center",
  },
  verifyButton: {
    backgroundColor: "#0098B3",
    paddingVertical: Sizes.md,
    borderRadius: 25,
    alignItems: "center",
  },
  verifyButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
});


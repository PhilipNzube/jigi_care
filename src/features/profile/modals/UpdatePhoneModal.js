import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import { useAuth } from "../../../shared/context/AuthContext";
import { updateProfile } from "../../auth/services/authService";
import LoadingOverlay from "../../../shared/components/LoadingOverlay";
import { showError, showSuccess } from "../../../shared/utils/toast";

export default function UpdatePhoneModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Update phone when modal opens or user data changes
  useEffect(() => {
    if (visible && user) {
      // Extract phone number (remove country code if present, as we'll add it separately)
      const userPhone = user?.phone || user?.phoneNumber || user?.mobile || user?.mobileNumber || user?.contactNumber || "";
      // Remove +234 or 234 prefix if present
      const phoneWithoutCountryCode = userPhone.replace(/^(\+?234)?\s*/, "");
      setPhone(phoneWithoutCountryCode);
    }
  }, [visible, user]);

  const handleSave = async () => {
    if (!phone.trim()) {
      showError("Phone number cannot be empty");
      return;
    }

    setIsLoading(true);

    try {
      const fullPhone = `+234${phone.trim()}`;
      const updatedUser = await updateProfile({ phone: fullPhone });
      await updateUser(updatedUser);
      showSuccess("Phone number updated successfully!");
      onClose();
    } catch (err) {
      console.error("❌ [UPDATE PHONE] Error updating phone:", err);
      showError(err.message || "Failed to update phone. Please try again.");
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
            <Text style={styles.title}>UPDATE PHONE NUMBER</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.grey} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Phone</Text>
            <View style={styles.inputContainer}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.flag}>🇳🇬</Text>
                <Text style={styles.countryCode}>+234</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.grey} />
              </View>
              <View style={styles.separator} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Enter phone number"
                placeholderTextColor={Colors.grey}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? "Saving..." : "Save"}
            </Text>
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
  countryCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  flag: {
    fontSize: 16,
    marginRight: Sizes.xs,
  },
  countryCode: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    marginRight: Sizes.xs,
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: "#E0E0E0",
    marginHorizontal: Sizes.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
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
  errorText: {
    color: "#FF0000",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    marginBottom: Sizes.sm,
    textAlign: "center",
  },
});

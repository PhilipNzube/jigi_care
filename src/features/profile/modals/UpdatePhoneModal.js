import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PhoneInput from "@sesamsolutions/phone-input";
import { Colors, Sizes } from "../../../shared/constants";
import { useAuth } from "../../../shared/context/AuthContext";
import { updateProfile } from "../../auth/services/authService";
import LoadingOverlay from "../../../shared/components/LoadingOverlay";
import { showError, showSuccess } from "../../../shared/utils/toast";

export default function UpdatePhoneModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneData, setPhoneData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update phone when modal opens or user data changes
  useEffect(() => {
    if (visible && user) {
      const userPhone =
        user?.phone ||
        user?.phoneNumber ||
        user?.mobile ||
        user?.mobileNumber ||
        user?.contactNumber ||
        "";
      if (userPhone) {
        setPhoneNumber(userPhone);
      } else {
        setPhoneNumber("");
      }
    }
  }, [visible, user]);

  const handlePhoneChange = (data) => {
    setPhoneData(data);
    // data contains: { phoneNumber, e164, isValid, countryCode, country }
    setPhoneNumber(data?.phoneNumber || "");
  };

  const handleSave = async () => {
    if (!phoneNumber.trim()) {
      showError("Please enter a phone number");
      return;
    }

    setIsLoading(true);

    try {
      // Use E.164 format if available, otherwise use phoneNumber
      const fullPhoneNumber = phoneData?.e164 || phoneNumber;
      const updatedUser = await updateProfile({ phone: fullPhoneNumber });
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
              <Text style={styles.title}>UPDATE PHONE NUMBER</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={styles.label}>Phone</Text>
              <View style={styles.phoneInputWrapper}>
                <PhoneInput
                  initialCountry="ng"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  style={styles.phoneInput}
                  textInputProps={{
                    placeholder: "Enter phone number",
                    placeholderTextColor: Colors.grey,
                    style: styles.phoneInputText,
                  }}
                  countryPickerProps={{
                    modalProps: {
                      presentationStyle:
                        Platform.OS === "ios" ? "fullScreen" : undefined,
                      animationType: "slide",
                    },
                    modalStyle: styles.pickerModalStyle,
                  }}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                isLoading && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? "Saving..." : "Save"}
              </Text>
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
  phoneInputWrapper: {
    marginBottom: Sizes.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: Sizes.sm,
    paddingTop: Sizes.xs,
  },
  phoneInput: {
    minHeight: 40,
  },
  phoneInputText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    paddingVertical: 0,
  },
  pickerModalStyle: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Sizes.lg,
    height: Dimensions.get("window").height,
    maxHeight: Dimensions.get("window").height,
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
});

import React, { useState, useEffect } from "react";
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

export default function EmergencyContactModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneData, setPhoneData] = useState(null);
  const [relationship, setRelationship] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRelationshipPicker, setShowRelationshipPicker] = useState(false);

  const relationships = [
    "Spouse",
    "Parent",
    "Sibling",
    "Child",
    "Friend",
    "Relative",
    "Colleague",
    "Other",
  ];

  // Initialize with user's emergency contact if available
  useEffect(() => {
    if (visible && user) {
      const emergencyContact = user?.emergencyContact || {};
      setFullName(emergencyContact.name || "");
      const userPhone = emergencyContact.phone || "";
      if (userPhone) {
        setPhoneNumber(userPhone);
      } else {
        setPhoneNumber("");
      }
      setRelationship(emergencyContact.relationship || "");
    }
  }, [visible, user]);

  const handlePhoneChange = (data) => {
    console.log("📞 [EMERGENCY CONTACT] Phone data received:", data);
    setPhoneData(data);
    // data contains: { phoneNumber, e164, input, isValid, countryCode, dialCode }
    // Use phoneNumber from data, or e164, or input as fallback
    const phoneValue = data?.phoneNumber || data?.e164 || data?.input || "";
    setPhoneNumber(phoneValue);
    console.log("📞 [EMERGENCY CONTACT] Phone number set to:", phoneValue);
  };

  const handleSave = async () => {
    // Validate all fields - check both phoneNumber state and phoneData
    const trimmedFullName = fullName.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedRelationship = relationship.trim();

    // Get phone number from phoneData - check input, e164, phoneNumber in that order
    // The phone input library may store the value in 'input' field
    const actualPhoneNumber =
      phoneData?.input?.trim() ||
      phoneData?.e164?.trim() ||
      phoneData?.phoneNumber?.trim() ||
      trimmedPhone;

    console.log("🔍 [EMERGENCY CONTACT] Validation check:", {
      fullName: trimmedFullName,
      phoneNumber: trimmedPhone,
      phoneData: phoneData,
      actualPhoneNumber: actualPhoneNumber,
      relationship: trimmedRelationship,
    });

    if (!trimmedFullName) {
      showError("Full name is required");
      return;
    }

    if (!actualPhoneNumber) {
      showError("Phone number is required");
      return;
    }

    if (!trimmedRelationship) {
      showError("Relationship is required");
      return;
    }

    setIsLoading(true);

    try {
      // Use E.164 format if available, otherwise use input, otherwise use phoneNumber state
      // Remove the dial code from input if it's there and use e164 format
      const fullPhoneNumber =
        phoneData?.e164 || phoneData?.input || actualPhoneNumber;

      console.log("💾 [EMERGENCY CONTACT] Saving:", {
        name: trimmedFullName,
        phone: fullPhoneNumber,
        relationship: trimmedRelationship,
      });

      const updatedUser = await updateProfile({
        emergencyContact: {
          name: trimmedFullName,
          phone: fullPhoneNumber,
          relationship: trimmedRelationship,
        },
      });
      await updateUser(updatedUser);
      showSuccess("Emergency contact updated successfully!");
      onClose();
    } catch (err) {
      console.error(
        "❌ [UPDATE EMERGENCY CONTACT] Error updating emergency contact:",
        err
      );
      showError(
        err.message || "Failed to update emergency contact. Please try again."
      );
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
              <Text style={styles.title}>EMERGENCY CONTACT</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={20} color={Colors.grey} />
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter full name"
                    placeholderTextColor={Colors.grey}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Relationship</Text>
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowRelationshipPicker(true)}
                >
                  <Text
                    style={[
                      styles.input,
                      !relationship && styles.placeholderText,
                    ]}
                  >
                    {relationship || "Select relationship"}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={Colors.grey} />
                </TouchableOpacity>
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

      {/* Relationship Picker Modal */}
      <Modal
        visible={showRelationshipPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRelationshipPicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <TouchableOpacity
            style={styles.pickerOverlayTouchable}
            onPress={() => setShowRelationshipPicker(false)}
          />
          <View
            style={[
              styles.pickerModal,
              { paddingBottom: Math.max(insets.bottom, Sizes.xl) },
            ]}
          >
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>SELECT RELATIONSHIP</Text>
              <TouchableOpacity
                onPress={() => setShowRelationshipPicker(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.pickerContent}
            >
              {relationships.map((rel) => (
                <TouchableOpacity
                  key={rel}
                  style={[
                    styles.pickerItem,
                    relationship === rel && styles.selectedPickerItem,
                  ]}
                  onPress={() => {
                    setRelationship(rel);
                    setShowRelationshipPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      relationship === rel && styles.selectedPickerItemText,
                    ]}
                  >
                    {rel}
                  </Text>
                  {relationship === rel && (
                    <Ionicons name="checkmark" size={20} color="#0098B3" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  inputGroup: {
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
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    marginLeft: Sizes.sm,
  },
  placeholderText: {
    color: Colors.grey,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  pickerOverlayTouchable: {
    flex: 1,
  },
  pickerModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Sizes.lg,
    paddingHorizontal: Sizes.lg,
    maxHeight: "60%",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  pickerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.grey,
  },
  pickerContent: {
    maxHeight: 300,
  },
  pickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.md,
    borderRadius: 8,
    marginBottom: Sizes.sm,
    backgroundColor: "#F8F8F8",
  },
  selectedPickerItem: {
    backgroundColor: "#E0F7FA",
    borderWidth: 1,
    borderColor: "#0098B3",
  },
  pickerItemText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
  },
  selectedPickerItemText: {
    color: "#0098B3",
    fontFamily: "Poppins-Bold",
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

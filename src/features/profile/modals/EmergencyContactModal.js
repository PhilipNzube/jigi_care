import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PhoneInput from "react-native-phone-number-input";
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
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const phoneInputRef = useRef(null);
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
        setFormattedPhoneNumber(userPhone);
      } else {
        setPhoneNumber("");
        setFormattedPhoneNumber("");
      }
      setRelationship(emergencyContact.relationship || "");
    }
  }, [visible, user]);

  const handleSave = async () => {
    if (
      !fullName.trim() ||
      !formattedPhoneNumber.trim() ||
      !relationship.trim()
    ) {
      showError("All fields are required");
      return;
    }

    // Validate phone number
    const isValid = phoneInputRef.current?.isValidNumber(formattedPhoneNumber);
    if (!isValid) {
      showError("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);

    try {
      const updatedUser = await updateProfile({
        emergencyContact: {
          name: fullName.trim(),
          phone: formattedPhoneNumber.trim(),
          relationship: relationship.trim(),
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
                <View style={styles.phoneInputContainer}>
                  <PhoneInput
                    ref={phoneInputRef}
                    defaultValue={phoneNumber}
                    defaultCode="NG"
                    layout="first"
                    onChangeText={(text) => {
                      setPhoneNumber(text);
                    }}
                    onChangeFormattedText={(text) => {
                      setFormattedPhoneNumber(text);
                    }}
                    containerStyle={styles.phoneInputContainerStyle}
                    textContainerStyle={styles.phoneInputTextContainer}
                    textInputStyle={styles.phoneInputText}
                    codeTextStyle={styles.phoneInputCodeText}
                    flagButtonStyle={styles.phoneInputFlagButton}
                    withDarkTheme={false}
                    withShadow={false}
                    autoFocus={false}
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
  phoneInputContainer: {
    marginBottom: Sizes.sm,
  },
  phoneInputContainerStyle: {
    width: "100%",
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: Sizes.sm,
  },
  phoneInputTextContainer: {
    backgroundColor: "transparent",
    paddingVertical: 0,
  },
  phoneInputText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    height: 24,
  },
  phoneInputCodeText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
  },
  phoneInputFlagButton: {
    marginRight: Sizes.sm,
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
  errorText: {
    color: "#FF0000",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    marginBottom: Sizes.sm,
    textAlign: "center",
  },
});

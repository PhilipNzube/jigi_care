import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function RequestMedicationModal({ visible, onClose }) {
  const [medicationName, setMedicationName] = useState("Lumatem");
  const [note, setNote] = useState("I need 1000g");

  const handleSubmit = () => {
    // Handle submit logic
    onClose();
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>REQUEST MEDICATION</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Medication Name</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={medicationName}
                    onChangeText={setMedicationName}
                    placeholder="Enter medication name"
                    placeholderTextColor={Colors.grey}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Note (Optional)</Text>
                <View style={styles.textAreaContainer}>
                  <TextInput
                    style={styles.textArea}
                    value={note}
                    onChangeText={setNote}
                    placeholder="Enter additional notes"
                    placeholderTextColor={Colors.grey}
                    multiline
                    maxLength={500}
                  />
                  <Text style={styles.characterCount}>
                    {note.length}/500 characters
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Submit Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
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
  modalContainer: {
    justifyContent: "flex-end",
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
    fontFamily: "Poppins-Bold",
    color: Colors.grey,
  },
  closeButton: {
    padding: Sizes.xs,
  },
  content: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: Sizes.lg,
  },
  label: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.grey,
    marginBottom: Sizes.sm,
  },
  inputContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: Sizes.sm,
  },
  input: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    paddingVertical: Sizes.sm,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: Sizes.sm,
  },
  textArea: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    minHeight: 80,
    textAlignVertical: "top",
  },
  characterCount: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    textAlign: "right",
    marginTop: Sizes.xs,
  },
  submitButton: {
    backgroundColor: "#0098B3",
    paddingVertical: Sizes.md,
    borderRadius: 25,
    alignItems: "center",
    marginTop: Sizes.lg,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function GenderPickerModal({
  visible,
  selectedGender,
  onGenderSelect,
  onClose,
}) {
  const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.pickerTitle}>Select Gender</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContent}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.pickerOption,
                  selectedGender === option && styles.selectedPickerOption,
                ]}
                onPress={() => {
                  onGenderSelect(option);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    selectedGender === option &&
                      styles.selectedPickerOptionText,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  pickerContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Sizes.xl,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cancelButton: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
  },
  pickerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.textPrimary,
  },
  doneButton: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
  },
  pickerContent: {
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.md,
  },
  pickerOption: {
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.md,
    borderRadius: 8,
    marginBottom: Sizes.xs,
  },
  selectedPickerOption: {
    backgroundColor: "#E3F2FD",
  },
  pickerOptionText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
  },
  selectedPickerOptionText: {
    color: Colors.primary,
    fontFamily: "Poppins-SemiBold",
  },
});

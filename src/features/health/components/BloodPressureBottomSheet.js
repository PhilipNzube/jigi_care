import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function BloodPressureBottomSheet({ visible, onClose, onSave }) {
  const [systolic, setSystolic] = useState("120");
  const [diastolic, setDiastolic] = useState("80");
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (!systolic || !diastolic) {
      Alert.alert("Error", "Please enter both systolic and diastolic values");
      return;
    }

    const reading = {
      systolic: parseInt(systolic),
      diastolic: parseInt(diastolic),
      note: note.trim(),
      timestamp: new Date(),
    };

    onSave(reading);
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
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>ADD BLOOD PRESSURE</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.inputSection}>
              <Text style={styles.label}>Systolic</Text>
              <Text style={styles.value}>{systolic}</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Diastolic</Text>
              <Text style={styles.value}>{diastolic}</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.noteSection}>
              <Text style={styles.noteLabel}>Note (Optional)</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Add a note about this reading..."
                value={note}
                onChangeText={setNote}
                multiline
                maxLength={500}
                placeholderTextColor="#9E9E9E"
              />
              <Text style={styles.characterCount}>
                {note.length}/500 characters
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Reading</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.lg,
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
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    marginBottom: Sizes.lg,
  },
  inputSection: {
    marginBottom: Sizes.md,
  },
  label: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#9E9E9E",
    marginBottom: Sizes.xs,
  },
  value: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  noteSection: {
    marginTop: Sizes.md,
  },
  noteLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  noteInput: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: Sizes.md,
    minHeight: 100,
    textAlignVertical: "top",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#9E9E9E",
    textAlign: "right",
    marginTop: Sizes.xs,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Sizes.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingVertical: Sizes.md,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#00BCD4",
    borderRadius: 8,
    paddingVertical: Sizes.md,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
});

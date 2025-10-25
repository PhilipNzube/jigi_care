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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function WeightBottomSheet({ visible, onClose, onSave }) {
  const [weight, setWeight] = useState("64.00");
  const [unit, setUnit] = useState("Kg");
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (!weight) {
      Alert.alert("Error", "Please enter a weight value");
      return;
    }

    const reading = {
      weight: parseFloat(weight),
      unit: unit,
      note: note.trim(),
      timestamp: new Date(),
    };

    if (onSave && typeof onSave === "function") {
      onSave(reading);
    }
    if (onClose && typeof onClose === "function") {
      onClose();
    }
  };

  const handleClose = () => {
    if (onClose && typeof onClose === "function") {
      onClose();
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
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>ADD WEIGHT</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.inputSection}>
                <Text style={styles.label}>Weight</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="scale" size={20} color="#9E9E9E" />
                  <Text style={styles.value}>{weight}</Text>
                  <View style={styles.unitSelector}>
                    <Text style={styles.unitText}>{unit}</Text>
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={Colors.textSecondary}
                    />
                  </View>
                </View>
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
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Reading</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
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
  safeArea: {
    flex: 0,
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Sizes.xs,
  },
  value: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginLeft: Sizes.sm,
    flex: 1,
  },
  unitSelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  unitText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    marginRight: Sizes.xs,
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
    borderRadius: 30,
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
    backgroundColor: "#0098B3",
    borderRadius: 30,
    paddingVertical: Sizes.md,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { updateHealthReading } from "../services/healthMonitoringService";
import { showSuccess, showError } from "../../../shared/utils/toast";
import LoadingOverlay from "../../../shared/components/LoadingOverlay";

export default function BloodPressureBottomSheet({ visible, onClose, onSave, editingData, healthRecordId }) {
  const insets = useSafeAreaInsets();
  const [systolic, setSystolic] = useState("120");
  const [diastolic, setDiastolic] = useState("80");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      // Prefill with existing data if available
      const bloodPressureData = editingData?.bloodPressure;
      if (bloodPressureData) {
        setSystolic(bloodPressureData.systolic?.toString() || "120");
        setDiastolic(bloodPressureData.diastolic?.toString() || "80");
        setNote(bloodPressureData.note || "");
      } else {
        // Default values if no existing data
        setSystolic("120");
        setDiastolic("80");
        setNote("");
      }
    }
  }, [visible, editingData]);

  const handleSave = async () => {
    if (!systolic || !diastolic) {
      Alert.alert("Error", "Please enter both systolic and diastolic values");
      return;
    }

    const readingData = {
      systolic: parseInt(systolic),
      diastolic: parseInt(diastolic),
      status: "normal", // You can add logic to determine status based on values
      note: note.trim(),
    };

    // If editing, use PATCH API
    if (healthRecordId && editingData) {
      try {
        setIsLoading(true);
        await updateHealthReading(healthRecordId, {
          bloodPressure: readingData,
        });
        showSuccess("Blood pressure updated successfully");
        if (onSave && typeof onSave === "function") {
          onSave(readingData);
        }
        if (onClose && typeof onClose === "function") {
          onClose();
        }
      } catch (error) {
        showError(error.message || "Failed to update blood pressure");
      } finally {
        setIsLoading(false);
      }
    } else {
      // For new readings, call onSave callback
      if (onSave && typeof onSave === "function") {
        onSave(readingData);
      }
      if (onClose && typeof onClose === "function") {
        onClose();
      }
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
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={onClose} />
        <View
          style={[
            styles.container,
            { paddingBottom: Math.max(insets.bottom, Sizes.xl) },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.title}>
                {editingData ? "EDIT BLOOD PRESSURE" : "ADD BLOOD PRESSURE"}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.inputSection}>
                <Text style={styles.label}>Systolic</Text>
                <TextInput
                  style={styles.valueInput}
                  value={systolic}
                  onChangeText={setSystolic}
                  keyboardType="numeric"
                  placeholder="120"
                />
                <View style={styles.divider} />
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.label}>Diastolic</Text>
                <TextInput
                  style={styles.valueInput}
                  value={diastolic}
                  onChangeText={setDiastolic}
                  keyboardType="numeric"
                  placeholder="80"
                />
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
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>
                  {isLoading ? "Saving..." : "Save Reading"}
                </Text>
              </TouchableOpacity>
            </View>
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
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.lg,
    maxHeight: "85%",
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
  valueInput: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
    paddingVertical: 0,
  },
  saveButtonDisabled: {
    opacity: 0.6,
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

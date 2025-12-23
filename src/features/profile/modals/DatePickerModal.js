import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DatePicker from "react-native-date-picker";
import { Colors, Sizes } from "../../../shared/constants";
import { useAuth } from "../../../shared/context/AuthContext";
import { updateProfile } from "../../auth/services/authService";
import LoadingOverlay from "../../../shared/components/LoadingOverlay";
import { showError, showSuccess } from "../../../shared/utils/toast";

export default function DatePickerModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with user's date of birth if available
  useEffect(() => {
    if (visible) {
      if (user?.dateOfBirth) {
        try {
          const date = new Date(user.dateOfBirth);
          // Validate date
          if (!isNaN(date.getTime())) {
            setSelectedDate(date);
          } else {
            // Default to current date if invalid
            setSelectedDate(new Date());
          }
        } catch (error) {
          console.error("Error parsing date of birth:", error);
          setSelectedDate(new Date());
        }
      } else {
        // Default to current date if no date of birth
        setSelectedDate(new Date());
      }
    }
  }, [visible, user]);

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Convert selected date to YYYY-MM-DD format
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const dateOfBirth = `${year}-${month}-${day}`;

      console.log("📅 [UPDATE DATE] Saving date of birth:", dateOfBirth);

      const updatedUser = await updateProfile({ dateOfBirth });
      await updateUser(updatedUser);
      showSuccess("Date of birth updated successfully!");
      onClose();
    } catch (err) {
      console.error("❌ [UPDATE DATE] Error updating date of birth:", err);
      showError(err.message || "Failed to update date of birth. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate maximum date (today - 100 years ago)
  const maxDate = new Date();
  const minDate = new Date();
  minDate.setFullYear(maxDate.getFullYear() - 100);

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
            <Text style={styles.title}>SELECT DATE OF BIRTH</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.grey} />
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <DatePicker
              date={selectedDate}
              onDateChange={setSelectedDate}
              mode="date"
              maximumDate={maxDate}
              minimumDate={minDate}
              androidVariant="iosClone"
              textColor={Colors.black}
              fadeToColor="transparent"
              style={styles.datePicker}
              locale="en"
            />
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
  pickerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: Sizes.lg,
    minHeight: 200,
    width: "100%",
  },
  datePicker: {
    height: 200,
  },
  saveButton: {
    backgroundColor: "#0098B3",
    paddingVertical: Sizes.md,
    borderRadius: 25,
    alignItems: "center",
    marginTop: Sizes.lg,
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

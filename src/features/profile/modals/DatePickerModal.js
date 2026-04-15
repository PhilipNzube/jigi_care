import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes, Fonts } from "../../../shared/constants";
import { useAuth } from "../../../shared/context/AuthContext";
import { updateProfile } from "../../auth/services/authService";
import LoadingOverlay from "../../../shared/components/LoadingOverlay";
import { showError, showSuccess } from "../../../shared/utils/toast";

const { width } = Dimensions.get("window");
const ITEM_HEIGHT = 44; // 40 height + 4 total vertical margin

export default function DatePickerModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthScrollRef = useRef(null);
  const dayScrollRef = useRef(null);
  const yearScrollRef = useRef(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysCount = getDaysInMonth(selectedDate.getFullYear(), selectedDate.getMonth());
  const days = Array.from({ length: daysCount }, (_, i) => i + 1);

  // Initialize with user's date
  useEffect(() => {
    if (visible) {
      const dateToUse = user?.dateOfBirth ? new Date(user.dateOfBirth) : new Date();
      if (!isNaN(dateToUse.getTime())) {
        setSelectedDate(dateToUse);
        
        // Auto-scroll to current values after a short delay for layout
        setTimeout(() => {
          const monthIndex = dateToUse.getMonth();
          const dayIndex = dateToUse.getDate() - 1;
          const yearIndex = years.indexOf(dateToUse.getFullYear());

          if (monthScrollRef.current) {
            monthScrollRef.current.scrollTo({ y: monthIndex * ITEM_HEIGHT, animated: true });
          }
          if (dayScrollRef.current) {
            dayScrollRef.current.scrollTo({ y: dayIndex * ITEM_HEIGHT, animated: true });
          }
          if (yearScrollRef.current) {
            yearScrollRef.current.scrollTo({ y: yearIndex * ITEM_HEIGHT, animated: true });
          }
        }, 100);
      }
    }
  }, [visible, user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const dateOfBirth = `${year}-${month}-${day}`;

      const updatedUser = await updateProfile({ dateOfBirth });
      await updateUser(updatedUser);
      showSuccess("Date of birth updated successfully!");
      onClose();
    } catch (err) {
      showError("Unable to update date of birth.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateDate = (type, value) => {
    const newDate = new Date(selectedDate);
    if (type === 'month') newDate.setMonth(value);
    if (type === 'day') newDate.setDate(value);
    if (type === 'year') newDate.setFullYear(value);
    setSelectedDate(newDate);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />
        <View style={[styles.modal, { paddingBottom: Math.max(insets.bottom, Sizes.xl) }]}>
          <View style={styles.header}>
            <Text style={styles.title}>SELECT DATE OF BIRTH</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.grey} />
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            {/* Month Column */}
            <View style={styles.column}>
              <Text style={styles.columnLabel}>Month</Text>
              <ScrollView ref={monthScrollRef} style={styles.scroll} showsVerticalScrollIndicator={false}>
                {months.map((m, i) => (
                  <TouchableOpacity 
                    key={m} 
                    style={[styles.item, selectedDate.getMonth() === i && styles.selectedItem]}
                    onPress={() => updateDate('month', i)}
                  >
                    <Text style={[styles.itemText, selectedDate.getMonth() === i && styles.selectedItemText]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Day Column */}
            <View style={styles.column}>
              <Text style={styles.columnLabel}>Day</Text>
              <ScrollView ref={dayScrollRef} style={styles.scroll} showsVerticalScrollIndicator={false}>
                {days.map(d => (
                  <TouchableOpacity 
                    key={d} 
                    style={[styles.item, selectedDate.getDate() === d && styles.selectedItem]}
                    onPress={() => updateDate('day', d)}
                  >
                    <Text style={[styles.itemText, selectedDate.getDate() === d && styles.selectedItemText]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Year Column */}
            <View style={styles.column}>
              <Text style={styles.columnLabel}>Year</Text>
              <ScrollView ref={yearScrollRef} style={styles.scroll} showsVerticalScrollIndicator={false}>
                {years.map(y => (
                  <TouchableOpacity 
                    key={y} 
                    style={[styles.item, selectedDate.getFullYear() === y && styles.selectedItem]}
                    onPress={() => updateDate('year', y)}
                  >
                    <Text style={[styles.itemText, selectedDate.getFullYear() === y && styles.selectedItemText]}>{y}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>{isLoading ? "Saving..." : "Save"}</Text>
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.poppins.semiBold,
    color: Colors.textPrimary,
  },
  pickerContainer: {
    flexDirection: "row",
    height: 250,
    marginBottom: Sizes.lg,
  },
  column: {
    flex: 1,
    alignItems: "center",
  },
  columnLabel: {
    fontSize: 12,
    fontFamily: Fonts.poppins.medium,
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
    textTransform: "uppercase",
  },
  scroll: {
    width: "100%",
  },
  item: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedItem: {
    backgroundColor: "#F0F9FB",
  },
  itemText: {
    fontSize: 15,
    fontFamily: Fonts.poppins.regular,
    color: Colors.textSecondary,
  },
  selectedItemText: {
    fontFamily: Fonts.poppins.semiBold,
    color: Colors.primary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Sizes.md,
    borderRadius: 25,
    alignItems: "center",
    marginTop: Sizes.md,
    marginBottom: Sizes.lg,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.poppins.bold,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
});

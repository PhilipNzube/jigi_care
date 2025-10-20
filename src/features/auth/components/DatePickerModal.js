import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function DatePickerModal({
  visible,
  selectedDate,
  onDateSelect,
  onClose,
}) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from(
    { length: 100 },
    (_, i) => new Date().getFullYear() - 18 - i
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.datePickerContainer}>
          <View style={styles.datePickerHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.datePickerTitle}>Date of Birth</Text>
            <TouchableOpacity onPress={onDateSelect}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.datePickerContent}>
            <View style={styles.dateColumn}>
              <Text style={styles.columnLabel}>Month</Text>
              <ScrollView
                style={styles.dateScrollView}
                showsVerticalScrollIndicator={false}
                snapToInterval={40}
                decelerationRate="fast"
              >
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.dateOption,
                      selectedDate.getMonth() === index &&
                        styles.selectedDateOption,
                    ]}
                    onPress={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(index);
                      // This would need to be handled by parent component
                    }}
                  >
                    <Text
                      style={[
                        styles.dateOptionText,
                        selectedDate.getMonth() === index &&
                          styles.selectedDateOptionText,
                      ]}
                    >
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.dateColumn}>
              <Text style={styles.columnLabel}>Day</Text>
              <ScrollView
                style={styles.dateScrollView}
                showsVerticalScrollIndicator={false}
                snapToInterval={40}
                decelerationRate="fast"
              >
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dateOption,
                      selectedDate.getDate() === day &&
                        styles.selectedDateOption,
                    ]}
                    onPress={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(day);
                      // This would need to be handled by parent component
                    }}
                  >
                    <Text
                      style={[
                        styles.dateOptionText,
                        selectedDate.getDate() === day &&
                          styles.selectedDateOptionText,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.dateColumn}>
              <Text style={styles.columnLabel}>Year</Text>
              <ScrollView
                style={styles.dateScrollView}
                showsVerticalScrollIndicator={false}
                snapToInterval={40}
                decelerationRate="fast"
              >
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.dateOption,
                      selectedDate.getFullYear() === year &&
                        styles.selectedDateOption,
                    ]}
                    onPress={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setFullYear(year);
                      // This would need to be handled by parent component
                    }}
                  >
                    <Text
                      style={[
                        styles.dateOptionText,
                        selectedDate.getFullYear() === year &&
                          styles.selectedDateOptionText,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
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
  datePickerContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Sizes.xl,
  },
  datePickerHeader: {
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
  datePickerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.textPrimary,
  },
  doneButton: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
  },
  datePickerContent: {
    flexDirection: "row",
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.md,
  },
  dateColumn: {
    flex: 1,
    alignItems: "center",
  },
  columnLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
  },
  dateScrollView: {
    height: 200,
    width: "100%",
  },
  dateOption: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 2,
  },
  selectedDateOption: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  dateOptionText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  selectedDateOptionText: {
    color: Colors.textPrimary,
    fontFamily: "Poppins-SemiBold",
  },
});

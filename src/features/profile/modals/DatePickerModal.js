import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function DatePickerModal({ visible, onClose }) {
  const [selectedDate, setSelectedDate] = useState("September 17 2021");

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
  const years = Array.from({ length: 10 }, (_, i) => 2018 + i);

  const handleSave = () => {
    // Handle save logic
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
        <View style={styles.modal}>
          <View style={styles.pickerContainer}>
            <ScrollView
              style={styles.pickerColumn}
              showsVerticalScrollIndicator={false}
            >
              {months.map((month, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.pickerItem,
                    selectedDate.includes(month) && styles.selectedItem,
                  ]}
                  onPress={() => setSelectedDate(`${month} 17 2021`)}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      selectedDate.includes(month) && styles.selectedText,
                    ]}
                  >
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView
              style={styles.pickerColumn}
              showsVerticalScrollIndicator={false}
            >
              {days.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.pickerItem,
                    selectedDate.includes(` ${day} `) && styles.selectedItem,
                  ]}
                  onPress={() => setSelectedDate(`September ${day} 2021`)}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      selectedDate.includes(` ${day} `) && styles.selectedText,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView
              style={styles.pickerColumn}
              showsVerticalScrollIndicator={false}
            >
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.pickerItem,
                    selectedDate.includes(year.toString()) &&
                      styles.selectedItem,
                  ]}
                  onPress={() => setSelectedDate(`September 17 ${year}`)}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      selectedDate.includes(year.toString()) &&
                        styles.selectedText,
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
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
  pickerContainer: {
    flexDirection: "row",
    height: 200,
    marginBottom: Sizes.lg,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: Sizes.xs,
  },
  pickerItem: {
    paddingVertical: Sizes.md,
    alignItems: "center",
  },
  selectedItem: {
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
  },
  pickerText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
  },
  selectedText: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
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
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function TimeSelectionSection({ selectedTime, onTimeSelect }) {
  const timeSlots = [
    { id: "9:00 AM", label: "9:00 AM" },
    { id: "10:00 AM", label: "10:00 AM" },
    { id: "11:00 AM", label: "11:00 AM" },
    { id: "12:00 PM", label: "12:00 PM" },
    { id: "1:00 PM", label: "1:00 PM" },
    { id: "2:00 PM", label: "2:00 PM" },
    { id: "3:00 PM", label: "3:00 PM" },
    { id: "4:00 PM", label: "4:00 PM" },
    { id: "5:00 PM", label: "5:00 PM" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Time</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timesContainer}
      >
        {timeSlots.map((time) => (
          <TouchableOpacity
            key={time.id}
            style={[
              styles.timeButton,
              selectedTime === time.id && styles.selectedTimeButton,
            ]}
            onPress={() => onTimeSelect(time.id)}
          >
            <Text
              style={[
                styles.timeText,
                selectedTime === time.id && styles.selectedTimeText,
              ]}
            >
              {time.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.xl,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginBottom: Sizes.md,
  },
  timesContainer: {
    flexDirection: "row",
    paddingRight: Sizes.lg,
  },
  timeButton: {
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: 20,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.sm,
  },
  selectedTimeButton: {
    backgroundColor: "#0098B3",
  },
  timeText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#666",
  },
  selectedTimeText: {
    color: Colors.white,
  },
});

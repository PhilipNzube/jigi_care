import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import { isToday, isPast, setHours, setMinutes } from "date-fns";

export default function TimeSelectionSection({ selectedTime, onTimeSelect, selectedDate }) {
  const allTimeSlots = [
    { id: "9:00 AM", label: "9:00 AM", hour: 9, minute: 0 },
    { id: "10:00 AM", label: "10:00 AM", hour: 10, minute: 0 },
    { id: "11:00 AM", label: "11:00 AM", hour: 11, minute: 0 },
    { id: "12:00 PM", label: "12:00 PM", hour: 12, minute: 0 },
    { id: "1:00 PM", label: "1:00 PM", hour: 13, minute: 0 },
    { id: "2:00 PM", label: "2:00 PM", hour: 14, minute: 0 },
    { id: "3:00 PM", label: "3:00 PM", hour: 15, minute: 0 },
    { id: "4:00 PM", label: "4:00 PM", hour: 16, minute: 0 },
    { id: "5:00 PM", label: "5:00 PM", hour: 17, minute: 0 },
  ];

  const [availableTimeSlots, setAvailableTimeSlots] = useState(allTimeSlots);

  useEffect(() => {
    if (selectedDate && isToday(selectedDate)) {
      // If selected date is today, filter out past times
      const now = new Date();
      const filteredSlots = allTimeSlots.filter(slot => {
        const slotDateTime = setMinutes(setHours(selectedDate, slot.hour), slot.minute);
        return !isPast(slotDateTime);
      });
      setAvailableTimeSlots(filteredSlots);
      
      // If the currently selected time is now in the past, clear it
      if (selectedTime) {
        const currentSelectedSlot = allTimeSlots.find(s => s.id === selectedTime);
        if (currentSelectedSlot) {
          const currentSelectedDateTime = setMinutes(setHours(selectedDate, currentSelectedSlot.hour), currentSelectedSlot.minute);
          if (isPast(currentSelectedDateTime)) {
            onTimeSelect(""); // Clear selected time if it's in the past
          }
        }
      }
    } else {
      // For future dates, show all time slots
      setAvailableTimeSlots(allTimeSlots);
    }
  }, [selectedDate, selectedTime, onTimeSelect]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Time</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timesContainer}
      >
        {availableTimeSlots.map((time) => (
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

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
import ShimmerLoader from "../../../shared/components/ShimmerLoader";

export default function TimeSelectionSection({ 
  selectedTime, 
  onTimeSelect, 
  selectedDate,
  availableSlots = [],
  isLoadingSlots = false,
}) {
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  useEffect(() => {
    if (availableSlots && availableSlots.length > 0) {
      // Map API slots to our format
      const mappedSlots = availableSlots.map((slot) => ({
        id: slot.display,
        label: slot.display,
        hour: slot.hour,
        minute: 0,
        value: slot.value,
      }));

      // If selected date is today, filter out past times
      if (selectedDate && isToday(selectedDate)) {
        const now = new Date();
        const filteredSlots = mappedSlots.filter((slot) => {
          const slotDateTime = setMinutes(setHours(selectedDate, slot.hour), slot.minute);
          return !isPast(slotDateTime);
        });
        setAvailableTimeSlots(filteredSlots);

        // If the currently selected time is now in the past, clear it
        if (selectedTime) {
          const currentSelectedSlot = mappedSlots.find((s) => s.id === selectedTime);
          if (currentSelectedSlot) {
            const currentSelectedDateTime = setMinutes(
              setHours(selectedDate, currentSelectedSlot.hour),
              currentSelectedSlot.minute
            );
            if (isPast(currentSelectedDateTime)) {
              onTimeSelect(""); // Clear selected time if it's in the past
            }
          }
        }
      } else {
        // For future dates, show all available slots
        setAvailableTimeSlots(mappedSlots);
      }
    } else {
      setAvailableTimeSlots([]);
    }
  }, [availableSlots, selectedDate, selectedTime, onTimeSelect]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Time</Text>
      {isLoadingSlots ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timesContainer}
        >
          {[1, 2, 3, 4, 5].map((index) => (
            <ShimmerLoader key={index}>
              <View style={styles.timeButtonSkeleton} />
            </ShimmerLoader>
          ))}
        </ScrollView>
      ) : availableTimeSlots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No available time slots for this date</Text>
        </View>
      ) : (
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
      )}
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
  timeButtonSkeleton: {
    width: 80,
    height: 36,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    marginRight: Sizes.sm,
  },
  emptyContainer: {
    paddingVertical: Sizes.md,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#999",
  },
});

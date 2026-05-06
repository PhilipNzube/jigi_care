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
      // Map API slots to our format and mark past times
      const mappedSlots = availableSlots.map((slot) => {
        // Check if this slot is in the past (only if selected date is today)
        let isPastTime = false;
        if (selectedDate && isToday(selectedDate)) {
          // Create date for this time slot
          const slotDate = new Date(selectedDate);
          
          // Set hours and minutes for the slot on the selected date
          slotDate.setHours(slot.hour, slot.minute || 0, 0, 0);
          
          isPastTime = isPast(slotDate);
        }

        return {
          id: slot.display,
          label: slot.display,
          hour: slot.hour,
          minute: 0,
          value: slot.value,
          isPast: isPastTime,
        };
      });

      setAvailableTimeSlots(mappedSlots);

      // If the currently selected time is now in the past, clear it
      if (selectedTime) {
        const currentSelectedSlot = mappedSlots.find((s) => s.id === selectedTime);
        if (currentSelectedSlot && currentSelectedSlot.isPast) {
          onTimeSelect(""); // Clear selected time if it's in the past
        }
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
          {availableTimeSlots.map((time) => {
            const isDisabled = time.isPast;
            
            return (
          <TouchableOpacity
            key={time.id}
            style={[
              styles.timeButton,
              selectedTime === time.id && styles.selectedTimeButton,
                  isDisabled && styles.disabledTimeButton,
            ]}
                onPress={() => {
                  if (!isDisabled) {
                    onTimeSelect(time.id);
                  }
                }}
                disabled={isDisabled}
          >
            <Text
              style={[
                styles.timeText,
                selectedTime === time.id && styles.selectedTimeText,
                    isDisabled && styles.disabledTimeText,
              ]}
            >
              {time.label}
            </Text>
          </TouchableOpacity>
            );
          })}
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
  disabledTimeButton: {
    backgroundColor: "#F5F5F5",
    opacity: 0.5,
  },
  disabledTimeText: {
    color: "#999",
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

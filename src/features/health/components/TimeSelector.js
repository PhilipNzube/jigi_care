import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import { format, isPast, setHours, setMinutes, startOfDay } from "date-fns";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function TimeSelector({ selectedTime, onTimeSelect, durationInHrs, selectedDate }) {
  const [timeSlots, setTimeSlots] = useState([]);
  const scrollViewRef = useRef(null);
  const timeRefs = useRef({});

  // Generate time slots based on duration
  useEffect(() => {
    const slots = [];
    const startHour = 9;
    const businessEndHour = 17; // 5 PM
    
    // Calculate end hour based on duration
    // If duration is 12hrs, show slots from 9 AM to 9 PM (12 hours), but cap at business hours
    let endHour = businessEndHour;
    if (durationInHrs) {
      // Calculate how many hours of slots to show based on duration
      // If duration is 12hrs, we want to show slots that span 12 hours
      const calculatedEndHour = startHour + Math.ceil(durationInHrs);
      endHour = Math.min(calculatedEndHour, businessEndHour);
    }
    
    // Generate slots every hour from startHour to endHour
    for (let hour = startHour; hour <= endHour; hour++) {
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const id = `${displayHour}:00 ${period}`;
      slots.push({ 
        id, 
        label: id,
        hour24: hour,
        isPast: false, // Will be updated in next effect
      });
    }
    
    setTimeSlots(slots);
  }, [durationInHrs]);

  // Mark past times and auto-select current/next available time
  useEffect(() => {
    if (timeSlots.length === 0) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Check if selected date is today
    const isToday = selectedDate && format(new Date(), "EEE d") === selectedDate;
    
    // Mark past times and find next available slot
    let selectedSlot = null;
    const updatedSlots = timeSlots.map((slot) => {
      let isPastTime = false;
      
      if (isToday) {
        // Check if this time slot is in the past
        const slotHour = slot.hour24;
        isPastTime = slotHour < currentHour || (slotHour === currentHour && currentMinute >= 30);
      }
      
      // Find first non-past slot for auto-selection
      if (!selectedSlot && !isPastTime && !selectedTime) {
        selectedSlot = slot.id;
      }
      
      return {
        ...slot,
        isPast: isPastTime,
      };
    });
    
    setTimeSlots(updatedSlots);
    
    // Auto-select if no time is selected
    if (!selectedTime && selectedSlot) {
      onTimeSelect(selectedSlot);
    }
  }, [selectedDate, timeSlots.length]);

  // Scroll to selected time when it changes
  useEffect(() => {
    if (selectedTime && timeSlots.length > 0 && scrollViewRef.current) {
      const selectedIndex = timeSlots.findIndex((t) => t.id === selectedTime);
      if (selectedIndex !== -1) {
        // Calculate scroll position
        const buttonWidth = 80; // Approximate width
        const margin = Sizes.sm;
        const buttonCenter = (buttonWidth + margin) * selectedIndex + buttonWidth / 2;
        const scrollPosition = Math.max(0, buttonCenter - SCREEN_WIDTH / 2);
        
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: scrollPosition,
            animated: true,
          });
        }, 100);
      }
    }
  }, [selectedTime, timeSlots]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Time</Text>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timesContainer}
      >
        {timeSlots.map((time, index) => {
          const isDisabled = time.isPast;
          
          return (
            <TouchableOpacity
              key={time.id}
              ref={(ref) => {
                if (ref) {
                  timeRefs.current[time.id] = ref;
                }
              }}
              style={[
                styles.timeButton,
                selectedTime === time.id && styles.selectedTimeButton,
                isDisabled && styles.disabledTimeButton,
              ]}
              onPress={() => {
                if (!isDisabled) {
                  onTimeSelect(time.id);
                  
                  // Scroll to selected time
                  if (scrollViewRef.current) {
                    const buttonWidth = 80;
                    const margin = Sizes.sm;
                    const buttonCenter = (buttonWidth + margin) * index + buttonWidth / 2;
                    const scrollPosition = Math.max(0, buttonCenter - SCREEN_WIDTH / 2);
                    
                    scrollViewRef.current.scrollTo({
                      x: scrollPosition,
                      animated: true,
                    });
                  }
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
});

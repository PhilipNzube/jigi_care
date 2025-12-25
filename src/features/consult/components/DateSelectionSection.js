import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import { startOfWeek, addDays, format, isSameDay, isPast, startOfDay } from "date-fns";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DateSelectionSection({ selectedDate, onDateSelect, onDateSelectWithObj }) {
  const [dates, setDates] = useState([]);
  const [today, setToday] = useState(new Date());
  const scrollViewRef = useRef(null);
  const dateRefs = useRef({});

  useEffect(() => {
    // Generate dates for the current week (Sunday to Saturday)
    const now = new Date();
    const today = startOfDay(now);
    
    // Get the start of the current week (Sunday)
    const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // 0 = Sunday
    const weekDates = [];

    // Generate 7 days from Sunday to Saturday
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const isPastDate = isPast(startOfDay(date)) && !isSameDay(date, today);
      
      weekDates.push({
        id: format(date, "EEE d"),
        dayName: format(date, "EEE"),
        dayNumber: format(date, "d"),
        fullDate: date, // Store full date for easier parsing
        date: date,
        isToday: isSameDay(date, today),
        isPast: isPastDate,
      });
    }

    setDates(weekDates);

    // Auto-select today's date
    const todayDate = weekDates.find((d) => d.isToday);
    if (todayDate && !selectedDate) {
      onDateSelect(todayDate.id);
      if (onDateSelectWithObj) {
        onDateSelectWithObj(todayDate.fullDate || todayDate.date);
      }
    } else if (weekDates.length > 0 && !selectedDate) {
      // Select first available (non-past) date if today is not available
      const firstAvailableDate = weekDates.find((d) => !d.isPast) || weekDates[0];
      onDateSelect(firstAvailableDate.id);
      if (onDateSelectWithObj) {
        onDateSelectWithObj(firstAvailableDate.fullDate || firstAvailableDate.date);
      }
    }
  }, []);

  // Scroll to selected date when it changes
  useEffect(() => {
    if (selectedDate && dates.length > 0 && scrollViewRef.current) {
      const selectedIndex = dates.findIndex((d) => d.id === selectedDate);
      if (selectedIndex !== -1) {
        // Calculate scroll position: (button width + margin) * index
        const buttonWidth = 50; // width from styles
        const margin = Sizes.sm; // marginRight from styles
        const buttonCenter = (buttonWidth + margin) * selectedIndex + buttonWidth / 2;
        
        // Scroll to center the selected date in the viewport
        const scrollPosition = Math.max(0, buttonCenter - SCREEN_WIDTH / 2);
        
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: scrollPosition,
            animated: true,
          });
        }, 100);
      }
    }
  }, [selectedDate, dates]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Date</Text>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.datesContainer}
      >
        {dates.map((date, index) => {
          const isDisabled = date.isPast;
          
          return (
            <TouchableOpacity
              key={date.id}
              ref={(ref) => {
                if (ref) {
                  dateRefs.current[date.id] = ref;
                }
              }}
              style={[
                styles.dateButton,
                selectedDate === date.id && styles.selectedDateButton,
                isDisabled && styles.disabledDateButton,
              ]}
              onPress={() => {
                if (!isDisabled) {
                  onDateSelect(date.id);
                  if (onDateSelectWithObj) {
                    onDateSelectWithObj(date.fullDate || date.date);
                  }
                  
                  // Scroll to selected date
                  if (scrollViewRef.current) {
                    const buttonWidth = 50;
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
                  styles.dayNameText,
                  selectedDate === date.id && styles.selectedDateText,
                  isDisabled && styles.disabledText,
                ]}
              >
                {date.dayName}
              </Text>
              <View
                style={[
                  styles.dayNumberContainer,
                  selectedDate === date.id && styles.selectedDayNumberContainer,
                  isDisabled && styles.disabledDayNumberContainer,
                ]}
              >
                <Text
                  style={[
                    styles.dayNumberText,
                    selectedDate === date.id && styles.selectedDateText,
                    isDisabled && styles.disabledText,
                  ]}
                >
                  {date.dayNumber}
                </Text>
              </View>
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
  datesContainer: {
    flexDirection: "row",
    paddingRight: Sizes.lg,
  },
  dateButton: {
    width: 50,
    height: 70,
    borderRadius: 25,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.sm,
  },
  selectedDateButton: {
    backgroundColor: "#0098B3",
  },
  dayNameText: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
    color: "#666",
    marginBottom: 2,
  },
  dayNumberContainer: {
    width: 34,
    height: 34,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDayNumberContainer: {
    backgroundColor: "#FFFFFF33",
    borderRadius: 30,
  },
  dayNumberText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#666",
  },
  selectedDateText: {
    color: Colors.white,
  },
  disabledDateButton: {
    backgroundColor: "#F5F5F5",
    opacity: 0.5,
  },
  disabledDayNumberContainer: {
    backgroundColor: "transparent",
  },
  disabledText: {
    color: "#999",
  },
});

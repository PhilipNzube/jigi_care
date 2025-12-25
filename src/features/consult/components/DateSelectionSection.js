import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import { startOfWeek, addDays, format, isSameDay } from "date-fns";

export default function DateSelectionSection({ selectedDate, onDateSelect, onDateSelectWithObj }) {
  const [dates, setDates] = useState([]);
  const [today, setToday] = useState(new Date());

  useEffect(() => {
    // Generate dates starting from today, only future dates
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekDates = [];

    // Generate next 14 days (2 weeks) of future dates
    for (let i = 0; i < 14; i++) {
      const date = addDays(today, i);
      weekDates.push({
        id: format(date, "EEE d"),
        dayName: format(date, "EEE"),
        dayNumber: format(date, "d"),
        fullDate: date, // Store full date for easier parsing
        date: date,
        isToday: isSameDay(date, now),
      });
    }

    setDates(weekDates);

    // Auto-select today's date if available
    const todayDate = weekDates.find((d) => d.isToday);
    if (todayDate && !selectedDate) {
      onDateSelect(todayDate.id);
      if (onDateSelectWithObj) {
        onDateSelectWithObj(todayDate.fullDate || todayDate.date);
      }
    } else if (weekDates.length > 0 && !selectedDate) {
      // Select first available date if today is not available
      const firstDate = weekDates[0];
      onDateSelect(firstDate.id);
      if (onDateSelectWithObj) {
        onDateSelectWithObj(firstDate.fullDate || firstDate.date);
      }
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Date</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.datesContainer}
      >
        {dates.map((date) => (
          <TouchableOpacity
            key={date.id}
            style={[
              styles.dateButton,
              selectedDate === date.id && styles.selectedDateButton,
            ]}
            onPress={() => {
              onDateSelect(date.id);
              if (onDateSelectWithObj) {
                onDateSelectWithObj(date.fullDate || date.date);
              }
            }}
          >
            <Text
              style={[
                styles.dayNameText,
                selectedDate === date.id && styles.selectedDateText,
              ]}
            >
              {date.dayName}
            </Text>
            <View
              style={[
                styles.dayNumberContainer,
                selectedDate === date.id && styles.selectedDayNumberContainer,
              ]}
            >
              <Text
                style={[
                  styles.dayNumberText,
                  selectedDate === date.id && styles.selectedDateText,
                ]}
              >
                {date.dayNumber}
              </Text>
            </View>
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
});

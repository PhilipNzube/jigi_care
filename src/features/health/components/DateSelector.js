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

export default function DateSelector({ selectedDate, onDateSelect }) {
  const [dates, setDates] = useState([]);
  const [today, setToday] = useState(new Date());

  useEffect(() => {
    // Generate this week's dates (Sunday to Saturday)
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 }); // Start from Sunday
    const weekDates = [];

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      weekDates.push({
        id: format(date, "EEE d"),
        dayName: format(date, "EEE"),
        dayNumber: format(date, "d"),
        date: date,
        isToday: isSameDay(date, new Date()),
      });
    }

    setDates(weekDates);

    // Auto-select today's date
    const todayDate = weekDates.find((d) => d.isToday);
    if (todayDate && !selectedDate) {
      onDateSelect(todayDate.id);
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
            onPress={() => onDateSelect(date.id)}
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

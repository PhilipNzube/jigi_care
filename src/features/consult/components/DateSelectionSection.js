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
import { 
  addDays, 
  format, 
  isSameDay, 
  startOfDay, 
} from "date-fns";
import Ionicons from "react-native-vector-icons/Ionicons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DateSelectionSection({ selectedDate, onDateSelect, onDateSelectWithObj }) {
  const today = startOfDay(new Date());
  const [dates, setDates] = useState([]);
  const [visibleDaysCount, setVisibleDaysCount] = useState(7); // Show 1 week initially
  const scrollViewRef = useRef(null);

  useEffect(() => {
    // Generate 15 days (Today + 14 days)
    const allDates = [];
    for (let i = 0; i < 15; i++) {
      const date = addDays(today, i);
      allDates.push({
        id: format(date, "EEE d"),
        dayName: format(date, "EEE"),
        dayNumber: format(date, "d"),
        fullDate: date,
        isToday: isSameDay(date, today),
      });
    }
    setDates(allDates);

    // Auto-select today if nothing selected
    if (!selectedDate && allDates.length > 0) {
      onDateSelect(allDates[0].id);
      onDateSelectWithObj(allDates[0].fullDate);
    }
  }, []);

  const handleShowMore = () => {
    setVisibleDaysCount(15);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Date</Text>
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.datesContainer}
      >
        {dates.slice(0, visibleDaysCount).map((date) => (
          <TouchableOpacity
            key={date.id}
            style={[
              styles.dateButton,
              selectedDate === date.id && styles.selectedDateButton,
            ]}
            onPress={() => {
              onDateSelect(date.id);
              onDateSelectWithObj(date.fullDate);
            }}
          >
            <Text style={[
              styles.dayNameText,
              selectedDate === date.id && styles.selectedDateText
            ]}>
              {date.dayName}
            </Text>
            <View style={[
              styles.dayNumberContainer,
              selectedDate === date.id && styles.selectedDayNumberContainer
            ]}>
              <Text style={[
                styles.dayNumberText,
                selectedDate === date.id && styles.selectedDateText
              ]}>
                {date.dayNumber}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Show More Icon if we have more dates and currently showing 7 */}
        {dates.length > 7 && visibleDaysCount === 7 && (
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={handleShowMore}
          >
            <View style={styles.moreIconContainer}>
              <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.moreText}>More</Text>
          </TouchableOpacity>
        )}
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
    alignItems: 'center',
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
    backgroundColor: Colors.primary,
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
  moreButton: {
    alignItems: 'center',
    marginLeft: Sizes.xs,
  },
  moreIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 152, 179, 0.1)",
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  moreText: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
  }
});

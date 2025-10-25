import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function DateSelector({ dates, selectedDate, onDateSelect }) {
  const renderDateButton = (date) => (
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
          styles.dateButtonText,
          selectedDate === date.id && styles.selectedDateButtonText,
        ]}
      >
        {date.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Select Date</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.datesContainer}
        contentContainerStyle={styles.datesContent}
      >
        {dates.map(renderDateButton)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  datesContainer: {
    marginHorizontal: -Sizes.lg,
  },
  datesContent: {
    paddingHorizontal: Sizes.lg,
  },
  dateButton: {
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    marginRight: Sizes.sm,
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    minWidth: 80,
  },
  selectedDateButton: {
    backgroundColor: "#0098B3",
  },
  dateButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
  },
  selectedDateButtonText: {
    color: Colors.white,
  },
});

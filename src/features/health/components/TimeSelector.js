import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function TimeSelector({
  timeSlots,
  selectedTime,
  onTimeSelect,
}) {
  const renderTimeButton = (time) => (
    <TouchableOpacity
      key={time}
      style={[
        styles.timeButton,
        selectedTime === time && styles.selectedTimeButton,
      ]}
      onPress={() => onTimeSelect(time)}
    >
      <Text
        style={[
          styles.timeButtonText,
          selectedTime === time && styles.selectedTimeButtonText,
        ]}
      >
        {time}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Select Time</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.timesContainer}
        contentContainerStyle={styles.timesContent}
      >
        {timeSlots.map(renderTimeButton)}
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
  timesContainer: {
    marginHorizontal: -Sizes.lg,
  },
  timesContent: {
    paddingHorizontal: Sizes.lg,
  },
  timeButton: {
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    marginRight: Sizes.sm,
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    minWidth: 100,
  },
  selectedTimeButton: {
    backgroundColor: "#0098B3",
  },
  timeButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
  },
  selectedTimeButtonText: {
    color: Colors.white,
  },
});

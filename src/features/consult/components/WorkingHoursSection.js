import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function WorkingHoursSection({ doctor }) {
  const consultantData = doctor?.consultantData || {};
  const workingHours = consultantData.workingHours;

  // If no working hours, show placeholder
  if (!workingHours || typeof workingHours !== 'object') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Working Hours</Text>
        <Text style={styles.content}>Working hours information not available</Text>
      </View>
    );
  }

  // Format working hours from object
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const hoursList = days
    .filter(day => workingHours[day])
    .map((day, index) => {
      const dayName = dayNames[days.indexOf(day)];
      return `${dayName}: ${workingHours[day]}`;
    });

  if (hoursList.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Working Hours</Text>
        <Text style={styles.content}>Working hours information not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Working Hours</Text>
      {hoursList.map((hours, index) => (
        <Text key={index} style={styles.content}>
          {hours}
        </Text>
      ))}
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
  content: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
  },
});

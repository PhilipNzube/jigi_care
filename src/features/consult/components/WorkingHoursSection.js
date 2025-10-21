import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function WorkingHoursSection({ doctor }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Working Hours</Text>
      <Text style={styles.content}>Mon - Fri: 10:00am - 3:00pm</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.xl,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: Sizes.md,
  },
  content: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
  },
});

import React from "react";
import { Text, StyleSheet } from "react-native";
import { Colors, Sizes } from "../constants";

export default function SectionTitle({
  title,
  style,
  color = Colors.textPrimary,
}) {
  return <Text style={[styles.sectionTitle, { color }, style]}>{title}</Text>;
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    marginBottom: Sizes.lg,
  },
});

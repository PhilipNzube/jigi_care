import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function AboutSection({ doctor }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About</Text>
      <Text style={styles.content}>
        {doctor.name} is a board certified {doctor.specialty.toLowerCase()} with{" "}
        {doctor.experience.toLowerCase()}. She is passionate about helping
        patients improve their neurological health.
      </Text>
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
    lineHeight: 20,
  },
});

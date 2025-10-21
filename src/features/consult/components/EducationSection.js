import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function EducationSection({ doctor }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Education</Text>
      <Text style={styles.content}>MD from Harvard Medical School</Text>
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

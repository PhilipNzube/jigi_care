import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function EducationSection({ doctor }) {
  const consultantData = doctor?.consultantData || {};
  const education = consultantData.education;

  // If no education data, show placeholder
  if (!education || (Array.isArray(education) && education.length === 0)) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Education</Text>
        <Text style={styles.content}>Education information not available</Text>
      </View>
    );
  }

  // Handle both array and string formats
  const educationList = Array.isArray(education) ? education : [education];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Education</Text>
      {educationList.map((edu, index) => (
        <Text key={index} style={styles.content}>
          {edu}
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

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function AboutSection({ doctor }) {
  const consultantData = doctor?.consultantData || {};
  const about = consultantData.about;
  const specialty = doctor?.specialty || consultantData?.speciality || "General Practitioner";
  const experience = doctor?.experience || 
    (consultantData.yrsOfExperience ? `${consultantData.yrsOfExperience}+ years experience` : "Experienced");

  // If no about text from API, generate a default description
  const aboutText = about || 
    `${doctor?.name || "This doctor"} is a ${specialty} with ${experience.toLowerCase()}. ` +
    `They are dedicated to providing quality healthcare services.`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>About</Text>
      <Text style={styles.content}>{aboutText}</Text>
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

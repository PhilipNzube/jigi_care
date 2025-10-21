import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function CertificationsSection({ doctor }) {
  const certifications = [
    "Board Certified Neurologist",
    "Neuromuscular Specialist",
    "Physical Therapist",
    "Occupational Therapist",
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Certifications</Text>
      {certifications.map((cert, index) => (
        <View key={index} style={styles.certificationItem}>
          <Ionicons name="ribbon-outline" size={16} color="#0098B3" />
          <Text style={styles.certificationText}>{cert}</Text>
        </View>
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
  certificationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  certificationText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
    marginLeft: Sizes.sm,
  },
});

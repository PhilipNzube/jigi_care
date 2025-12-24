import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function CertificationsSection({ doctor }) {
  const consultantData = doctor?.consultantData || {};
  const certifications = consultantData.certification;

  // If no certifications, show placeholder
  if (!certifications || (Array.isArray(certifications) && certifications.length === 0)) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Certifications</Text>
        <Text style={styles.content}>Certification information not available</Text>
      </View>
    );
  }

  // Handle both array and string formats
  const certList = Array.isArray(certifications) ? certifications : [certifications];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Certifications</Text>
      {certList.map((cert, index) => (
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

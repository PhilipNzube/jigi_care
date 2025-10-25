import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function SecuritySection() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Security</Text>

      <View style={styles.card}>
        <View style={styles.securityItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="finger-print" size={20} color="#0098B3" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Biometric Log in</Text>
            <Text style={styles.subtitle}>Use fingerprint or face id</Text>
          </View>
          <View style={styles.toggleContainer}>
            <View style={styles.toggleOff} />
          </View>
        </View>

        <View style={styles.securityItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={20} color="#E91E63" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Data Encryption</Text>
            <Text style={styles.subtitle}>HIPAA compliant encryption</Text>
          </View>
          <View style={styles.activeTag}>
            <Text style={styles.activeText}>Active</Text>
          </View>
        </View>
      </View>
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
    color: Colors.black,
    marginBottom: Sizes.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.md,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  securityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Sizes.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 152, 179, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
  },
  toggleContainer: {
    marginLeft: Sizes.sm,
  },
  toggleOff: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E0E0E0",
    position: "relative",
  },
  activeTag: {
    backgroundColor: "#0098B3",
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
});




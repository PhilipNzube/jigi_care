import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

const MedicationsSection = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Medications</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.medicationCard}>
        <View style={styles.medicationHeader}>
          <Text style={styles.medicationDate}>Sep 25th, 2025 • 12:00 PM</Text>
          <View style={styles.statusRow}>
            <View style={styles.checkbox}>
              <Ionicons name="checkmark" size={16} color={Colors.white} />
            </View>
            <Text style={styles.statusText}>Taken</Text>
          </View>
        </View>
        <View style={styles.medicationContent}>
          <View style={styles.medicationItem}>
            <View style={styles.medicationImageContainer}>
              <View style={styles.medicationImage} />
            </View>
            <View style={styles.medicationInfo}>
              <Text style={styles.medicationName}>Acetaminophen</Text>
              <Text style={styles.medicationDosage}>500mg • Twice daily</Text>
              <Text style={styles.medicationDescription}>
                Pain reliever and fever reducer
              </Text>
            </View>
            <View style={styles.medicationStatus}>
              <View
                style={[styles.statusTag, { backgroundColor: "#F2C94C1F" }]}
              >
                <Text style={[styles.statusTagText, { color: "#856404" }]}>
                  Running Low
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#007AFF",
  },
  medicationCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.sm,
    marginBottom: Sizes.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  medicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  medicationDate: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  medicationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  medicationImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FF6B6B",
    marginRight: Sizes.md,
    justifyContent: "center",
    alignItems: "center",
  },
  medicationImage: {
    width: 24,
    height: 24,
    backgroundColor: Colors.white,
    borderRadius: 4,
  },
  medicationInfo: {
    flex: 1,
    marginRight: Sizes.sm,
  },
  medicationName: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#000",
    marginBottom: Sizes.xs,
  },
  medicationDosage: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#5B6B62",
    marginBottom: Sizes.xs,
  },
  medicationDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  medicationStatus: {
    alignItems: "flex-end",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.xs,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#C89A0F",
  },
  statusTag: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTagText: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
  },
  medicationContent: {
    padding: Sizes.md,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
  },
});

export default MedicationsSection;

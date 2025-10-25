import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

const ExportHealthDataSection = () => {
  return (
    <View style={styles.container}>
      <View style={styles.exportCard}>
        <View style={styles.exportInfo}>
          <Text style={styles.exportTitle}>Export Health Data</Text>
          <Text style={styles.exportDescription}>
            Share with your healthcare provider
          </Text>
        </View>
        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportButtonText}>Export PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.xl,
  },
  exportCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  exportInfo: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  exportDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  exportButton: {
    backgroundColor: "#00BCD4",
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: 8,
  },
  exportButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
});

export default ExportHealthDataSection;

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function FeatureCards({ onMyResults, onLabCenters }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.featureCard} onPress={onMyResults}>
        <View style={styles.featureIcon}>
          <Ionicons name="bar-chart" size={24} color="#EA4D4D" />
        </View>
        <Text style={styles.featureTitle}>My Results</Text>
        <Text style={styles.featureDescription}>
          Check and review your laboratory results.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.featureCard} onPress={onLabCenters}>
        <View style={styles.featureIcon}>
          <Ionicons name="location" size={24} color="#EA4D4D" />
        </View>
        <Text style={styles.featureTitle}>Lab Centers</Text>
        <Text style={styles.featureDescription}>
          Locate nearby lab centers.
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: Sizes.lg,
    marginBottom: Sizes.lg,
    gap: Sizes.md,
  },
  featureCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.lg,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 0,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#E0247814",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  featureDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});

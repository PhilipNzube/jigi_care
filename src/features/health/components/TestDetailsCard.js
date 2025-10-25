import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function TestDetailsCard({ test }) {
  return (
    <View style={styles.container}>
      <View style={styles.testInfoCard}>
        <Image source={test.image} style={styles.testImage} />
        <View style={styles.testInfo}>
          <Text style={styles.testName}>{test.name}</Text>
          <Text style={styles.testDescription}>{test.description}</Text>
          <Text style={styles.testPrice}>{test.price}</Text>
        </View>
      </View>

      <View style={styles.testDetailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Test Duration:</Text>
          <Text style={styles.detailValue}>{test.duration}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Preparation:</Text>
          <Text style={styles.detailValue}>{test.preparation}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Sizes.lg,
  },
  testInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: Sizes.lg,
    marginBottom: Sizes.md,
  },
  testImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: Sizes.md,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
    marginBottom: Sizes.xs,
  },
  testDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
    opacity: 0.9,
    marginBottom: Sizes.sm,
  },
  testPrice: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
  testDetailsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: Sizes.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.xs,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
    opacity: 0.8,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
});

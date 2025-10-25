import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function HealthMetricsSection() {
  const metrics = [
    {
      value: "0+",
      label: "Blood Type",
    },
    {
      value: "165 lbs",
      label: "Weight",
    },
    {
      value: "5'10\"",
      label: "Height",
    },
  ];

  return (
    <View style={styles.container}>
      {metrics.map((metric, index) => (
        <View key={index} style={styles.card}>
          <Text numberOfLines={1} style={styles.value}>
            {metric.value}
          </Text>
          <Text numberOfLines={1} style={styles.label}>
            {metric.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Sizes.lg,
    marginBottom: Sizes.lg,
  },
  card: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: Sizes.md,
    alignItems: "center",
    marginHorizontal: Sizes.xs,
  },
  value: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
    textAlign: "center",
  },
});

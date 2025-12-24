import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import { useAuth } from "../../../shared/context/AuthContext";

export default function HealthMetricsSection() {
  const { user } = useAuth();

  // Format weight, height, and blood type with N/A fallback
  const formatWeight = (weight) => {
    if (!weight) return "N/A";
    return weight;
  };

  const formatHeight = (height) => {
    if (!height) return "N/A";
    return height;
  };

  const formatBloodType = (bloodType) => {
    if (!bloodType) return "N/A";
    return bloodType;
  };

  const userWeight = formatWeight(user?.weight);
  const userHeight = formatHeight(user?.height);
  const userBloodType = formatBloodType(user?.bloodType);

  const metrics = [
    {
      value: userBloodType,
      label: "Blood Type",
    },
    {
      value: userWeight,
      label: "Weight",
    },
    {
      value: userHeight,
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

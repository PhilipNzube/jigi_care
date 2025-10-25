import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function StatsSection() {
  const stats = [
    {
      icon: "scale",
      value: "64.00 kg",
      label: "Weight",
    },
    {
      icon: "resize",
      value: "5.80 ft",
      label: "Height",
    },
    {
      icon: "water",
      value: "0+",
      label: "Blood Type",
    },
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.statCard}>
          <Text style={styles.value}>{stat.value}</Text>
          <View style={styles.labelContainer}>
            <Ionicons name={stat.icon} size={16} color={Colors.grey} />
            <Text style={styles.label}>{stat.label}</Text>
          </View>
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
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: Sizes.md,
    alignItems: "center",
    marginHorizontal: Sizes.xs,
  },
  value: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
    marginBottom: Sizes.xs,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
    marginLeft: 4,
  },
});




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
      <View style={styles.card}>
        <View style={styles.content}>
          {stats.map((stat, index) => (
            <View
              key={index}
              style={[
                styles.statCard,
                index === stats.length - 1 && styles.lastStatCard,
              ]}
            >
              <Text style={styles.value}>{stat.value}</Text>
              <View style={styles.labelContainer}>
                <Ionicons name={stat.icon} size={16} color={Colors.grey} />
                <Text style={styles.label}>{stat.label}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.lg,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.sm,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  content: {
    padding: Sizes.md,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Sizes.sm,
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
  },
  value: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: Sizes.xs,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    marginLeft: 4,
  },
  lastStatCard: {
    borderRightWidth: 0,
  },
});

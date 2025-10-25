import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function StatsCards() {
  const stats = [
    {
      icon: "calendar",
      count: "16",
      label: "Appointments",
      color: "#E91E63",
    },
    {
      icon: "document-text",
      count: "5",
      label: "Reports",
      color: "#E91E63",
    },
    {
      icon: "medical",
      count: "3",
      label: "Active Meds",
      color: "#E91E63",
    },
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.card}>
          <View style={[styles.iconContainer, { backgroundColor: stat.color }]}>
            <Ionicons name={stat.icon} size={24} color={Colors.white} />
          </View>
          <Text style={styles.count}>{stat.count}</Text>
          <Text style={styles.label}>{stat.label}</Text>
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
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.md,
    alignItems: "center",
    marginHorizontal: Sizes.xs,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  count: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    textAlign: "center",
  },
});




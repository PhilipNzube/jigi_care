import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function EmptyNotificationsState() {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off" size={80} color="#B0B0B0" />
      <Text style={styles.emptyText}>No Notifications</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: Sizes.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
    marginTop: Sizes.lg,
  },
});


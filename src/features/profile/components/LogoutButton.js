import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function LogoutButton({ onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.text}>Sign out</Text>
      <Ionicons name="chevron-forward" size={20} color="#D32F2F" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.xl,
  },
  text: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#D32F2F",
  },
});




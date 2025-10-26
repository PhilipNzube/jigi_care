import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function LogoutButton({ onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.text}>Sign out</Text>
      <Ionicons name="chevron-forward" size={20} color="#EA4D4D" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#EA4D4D14",
    borderRadius: 12,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.xl,
    borderWidth: 1,
    borderColor: "#FAD1D1",
  },
  text: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#EA4D4D",
  },
});




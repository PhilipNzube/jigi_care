import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function ProfileHeader({ onSettings }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <TouchableOpacity style={styles.settingsButton} onPress={onSettings}>
        <Ionicons name="settings-outline" size={24} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
  settingsButton: {
    padding: Sizes.xs,
  },
});

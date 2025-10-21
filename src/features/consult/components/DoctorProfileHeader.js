import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function DoctorProfileHeader({
  onBackPress,
  title = "Doctor Profile",
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
        <Ionicons name="chevron-back" size={24} color={Colors.white} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity style={styles.favoriteButton}>
        <Ionicons name="heart-outline" size={24} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Sizes.xs,
    paddingVertical: Sizes.md,
    marginHorizontal: Sizes.lg,
    marginTop: Sizes.sm,
    borderRadius: 16,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF14",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
    flex: 1,
    textAlign: "center",
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF14",
    justifyContent: "center",
    alignItems: "center",
  },
});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function NotificationsHeader({ onClose }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Notifications</Text>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={24} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF14",
    marginHorizontal: Sizes.lg,
    marginTop: 50,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
    flex: 1,
    textAlign: "center",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#FFFFFF14",
    justifyContent: "center",
    alignItems: "center",
  },
});

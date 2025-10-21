import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function FloatingActionButton({ onPress, isChatMode = false }) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      {isChatMode ? (
        <Ionicons name="close" size={24} color={Colors.white} />
      ) : (
        <>
          <Ionicons name="chatbubble-outline" size={24} color={Colors.white} />
          <Text style={styles.fabText}>Chat with us</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 30,
    right: Sizes.lg,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
    marginLeft: Sizes.sm,
  },
});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function EmergencySection() {
  const handleEmergencyCall = () => {
    console.log("Emergency call pressed");
    // Implement emergency call functionality
  };

  return (
    <View style={styles.container}>
      <View style={styles.emergencyCard}>
        <View style={styles.emergencyIcon}>
          <Ionicons name="warning" size={20} color={Colors.white} />
        </View>

        <View style={styles.emergencyContent}>
          <Text style={styles.emergencyTitle}>Emergency?</Text>
          <Text style={styles.emergencyDescription}>
            For life-threatening situations, call 911 immediately.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={handleEmergencyCall}
        >
          <Text style={styles.emergencyButtonText}>Call 911</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  emergencyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE5E5",
    borderRadius: 12,
    padding: Sizes.md,
  },
  emergencyIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: Sizes.xs,
  },
  emergencyDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#666",
    lineHeight: 16,
  },
  emergencyButton: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  emergencyButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#FF6B6B",
  },
});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

export default function EmergencySection() {
  const handleEmergencyCall = () => {
    console.log("Emergency call pressed");
    // Implement emergency call functionality
  };

  return (
    <View style={styles.container}>
      <View style={styles.emergencyCard}>
        <View style={styles.emergencyIcon}>
          <Image
            source={Images.emergency}
            style={styles.emergencyImage}
            resizeMode="contain"
          />
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
    backgroundColor: "#E732320A",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#FAD1D1",
    padding: Sizes.md,
  },
  emergencyIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#EA4D4D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
  },
  emergencyImage: {
    width: 20,
    height: 20,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 14,
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
    borderRadius: 25,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
  },
  emergencyButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#EA4D4D",
  },
});

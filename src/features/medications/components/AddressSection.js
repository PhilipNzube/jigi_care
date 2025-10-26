import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function AddressSection() {
  const handleEditAddress = () => {
    // Handle edit address logic
    console.log("Edit address pressed");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Home Address</Text>

      <View style={styles.addressContainer}>
        <View style={styles.addressRow}>
          <View style={styles.addressIcon}>
            <Ionicons name="location-outline" size={20} color={Colors.grey} />
          </View>
          <Text style={styles.addressText}>423 Jakande Estate</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditAddress}
          >
            <Ionicons name="pencil" size={18} color={Colors.grey} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.lg,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    marginBottom: Sizes.sm,
  },
  addressContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.md,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressIcon: {
    marginRight: Sizes.sm,
  },
  addressText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    flex: 1,
  },
  editButton: {
    padding: Sizes.xs,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginTop: Sizes.md,
  },
});

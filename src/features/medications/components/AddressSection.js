import React, { useState, useImperativeHandle, forwardRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

const AddressSection = forwardRef((props, ref) => {
  const [address, setAddress] = useState("423 Jakande Estate");
  const [isEditing, setIsEditing] = useState(false);

  // Expose address value via ref
  useImperativeHandle(ref, () => ({
    getAddress: () => address,
  }));

  const handleEditAddress = () => {
    setIsEditing(true);
  };

  const handleSaveAddress = () => {
    setIsEditing(false);
    // Handle save address logic here
    console.log("Address saved:", address);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setAddress("423 Jakande Estate"); // Reset to original value
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Home Address</Text>

      <View style={styles.addressField}>
        <View style={styles.addressRow}>
          <View style={styles.addressIcon}>
            <Ionicons name="location-outline" size={20} color={Colors.grey} />
          </View>
          {isEditing ? (
            <TextInput
              style={styles.addressInput}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your address"
              placeholderTextColor={Colors.grey}
              autoFocus={true}
            />
          ) : (
            <Text style={styles.addressText}>{address}</Text>
          )}
          <TouchableOpacity
            style={styles.editButton}
            onPress={isEditing ? handleSaveAddress : handleEditAddress}
          >
            <Ionicons
              name={isEditing ? "checkmark" : "pencil"}
              size={18}
              color={isEditing ? "#0098B3" : Colors.grey}
            />
          </TouchableOpacity>
          {isEditing && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelEdit}
            >
              <Ionicons name="close" size={18} color="#F44336" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.underline} />
      </View>
    </View>
  );
});

AddressSection.displayName = "AddressSection";

export default AddressSection;

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
  addressField: {
    paddingVertical: Sizes.sm,
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
  addressInput: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    flex: 1,
    paddingVertical: 0,
  },
  editButton: {
    padding: Sizes.xs,
  },
  cancelButton: {
    padding: Sizes.xs,
    marginLeft: Sizes.xs,
  },
  underline: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginTop: Sizes.md,
  },
});

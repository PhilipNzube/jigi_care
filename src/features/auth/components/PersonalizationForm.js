import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function PersonalizationForm({
  gender,
  dateOfBirth,
  showDatePicker,
  onGenderPress,
  onDatePress,
}) {
  return (
    <View style={styles.formContainer}>
      {/* Gender Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Gender</Text>
        <TouchableOpacity style={styles.inputContainer} onPress={onGenderPress}>
          <View style={styles.inputIcon}>
            <Ionicons
              name="person-outline"
              size={20}
              color={Colors.textSecondary}
            />
          </View>
          <Text style={[styles.textInput, !gender && styles.placeholderText]}>
            {gender || "Select Gender"}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Date of Birth Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Date of Birth</Text>
        <TouchableOpacity
          style={[
            styles.inputContainer,
            showDatePicker && styles.inputContainerActive,
          ]}
          onPress={onDatePress}
        >
          <View style={styles.inputIcon}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={Colors.textSecondary}
            />
          </View>
          <Text
            style={[styles.textInput, !dateOfBirth && styles.placeholderText]}
          >
            {dateOfBirth || "Select Date"}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
        <Text style={styles.optionalText}>
          (Optional) You can update later in your profile
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    marginBottom: Sizes.xl,
  },
  fieldContainer: {
    marginBottom: Sizes.lg,
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Sizes.md,
  },
  inputContainerActive: {
    borderBottomColor: Colors.primary,
  },
  inputIcon: {
    marginRight: Sizes.md,
  },
  textInput: {
    flex: 1,
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
  optionalText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    fontStyle: "italic",
    marginTop: Sizes.xs,
  },
});

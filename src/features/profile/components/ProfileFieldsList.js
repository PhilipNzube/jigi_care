import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function ProfileFieldsList({ onFieldPress }) {
  const fields = [
    {
      id: "fullName",
      label: "Full Name",
      value: "Tim Bod",
    },
    {
      id: "email",
      label: "Email",
      value: "youremail@example.com",
    },
    {
      id: "phoneNumber",
      label: "Phone Number",
      value: "0800 0000 000",
    },
    {
      id: "changePassword",
      label: "Change Password",
      value: "**********",
    },
    {
      id: "dateOfBirth",
      label: "Date of Birth",
      value: "Aug 24th, 1829",
    },
    {
      id: "gender",
      label: "Gender",
      value: "Male",
    },
  ];

  return (
    <View style={styles.container}>
      {fields.map((field, index) => (
        <TouchableOpacity
          key={field.id}
          style={[
            styles.fieldItem,
            index === fields.length - 1 && styles.lastFieldItem,
          ]}
          onPress={() => onFieldPress(field.id)}
        >
          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <Text style={styles.fieldValue}>{field.value}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: Sizes.lg,
  },
  fieldItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  lastFieldItem: {
    borderBottomWidth: 0,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
  },
});

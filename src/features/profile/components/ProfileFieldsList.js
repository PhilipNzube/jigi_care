import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { useAuth } from "../../../shared/context/AuthContext";

export default function ProfileFieldsList({ onFieldPress }) {
  const { user } = useAuth();

  // Extract user data with fallbacks
  const userName = user?.fullName || user?.name || "Not set";
  const userEmail = user?.email || "Not set";
  // Check multiple possible phone field names from backend
  const userPhone = user?.phone || user?.phoneNumber || user?.mobile || user?.mobileNumber || user?.contactNumber || "Not set";

  const fields = [
    {
      id: "fullName",
      label: "Full Name",
      value: userName,
    },
    {
      id: "email",
      label: "Email",
      value: userEmail,
    },
    {
      id: "phoneNumber",
      label: "Phone Number",
      value: userPhone,
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
      <View style={styles.card}>
        <View style={styles.content}>
          {fields.map((field, index) => (
            <View key={field.id}>
              <TouchableOpacity
                style={styles.fieldItem}
                onPress={() => onFieldPress(field.id)}
              >
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <Text style={styles.fieldValue}>{field.value}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.grey}
                />
              </TouchableOpacity>
              {index < fields.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.lg,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.sm,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  content: {
    padding: Sizes.md,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
  },
  fieldItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Sizes.sm,
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
    color: "#666666",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: Sizes.sm,
  },
});

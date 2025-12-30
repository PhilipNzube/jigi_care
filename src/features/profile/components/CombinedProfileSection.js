import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { useAuth } from "../../../shared/context/AuthContext";

export default function CombinedProfileSection({ onFieldPress }) {
  const { user } = useAuth();

  // Extract user data with fallbacks
  const userName = user?.fullName || user?.name || "Not set";
  const userEmail = user?.email || "Not set";
  // Check multiple possible phone field names from backend
  const userPhone = user?.phone || user?.phoneNumber || user?.mobile || user?.mobileNumber || user?.contactNumber || "Not set";

  // Format date of birth
  const formatDateOfBirth = (dateString) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      const month = date.toLocaleString("default", { month: "short" });
      const day = date.getDate();
      const year = date.getFullYear();
      // Get ordinal suffix for day
      const getOrdinalSuffix = (day) => {
        if (day > 3 && day < 21) return "th";
        switch (day % 10) {
          case 1: return "st";
          case 2: return "nd";
          case 3: return "rd";
          default: return "th";
        }
      };
      return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
    } catch (error) {
      return "Not set";
    }
  };

  const userDateOfBirth = formatDateOfBirth(user?.dateOfBirth);

  // Format gender
  const formatGender = (gender) => {
    if (!gender) return "Not set";
    const genderMap = {
      male: "Male",
      female: "Female",
      other: "Other",
      prefer_not_to_say: "Prefer not to say",
    };
    return genderMap[gender.toLowerCase()] || gender;
  };

  const userGender = formatGender(user?.gender);

  // Format address
  const userAddress = user?.address || "Not set";

  // Format emergency contact
  const formatEmergencyContact = (emergencyContact) => {
    if (!emergencyContact || !emergencyContact.name) return "Not set";
    const name = emergencyContact.name;
    const phone = emergencyContact.phone || "";
    return phone ? `${name} (${phone})` : name;
  };

  const userEmergencyContact = formatEmergencyContact(user?.emergencyContact);

  // Format weight, height, and blood type with N/A fallback
  const formatWeight = (weight) => {
    if (!weight) return "N/A";
    return weight;
  };

  const formatHeight = (height) => {
    if (!height) return "N/A";
    return height;
  };

  const formatBloodType = (bloodType) => {
    if (!bloodType) return "N/A";
    return bloodType;
  };

  const userWeight = formatWeight(user?.weight);
  const userHeight = formatHeight(user?.height);
  const userBloodType = formatBloodType(user?.bloodType);

  const stats = [
    {
      id: "weight",
      icon: "scale",
      value: userWeight,
      label: "Weight",
    },
    {
      id: "height",
      icon: "resize",
      value: userHeight,
      label: "Height",
    },
    {
      id: "bloodType",
      icon: "water",
      value: userBloodType,
      label: "Blood Type",
    },
  ];

  const fields = [
    {
      id: "fullName",
      label: "Full Name",
      value: userName,
    },
    // {
    //   id: "email",
    //   label: "Email",
    //   value: userEmail,
    // },
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
      value: userDateOfBirth,
    },
    {
      id: "gender",
      label: "Gender",
      value: userGender,
    },
    {
      id: "address",
      label: "Address",
      value: userAddress,
    },
    {
      id: "emergencyContact",
      label: "Emergency Contact",
      value: userEmergencyContact,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.statsSection}>
          {stats.map((stat, index) => (
            <TouchableOpacity
              key={stat.id}
              style={[
                styles.statCard,
                index === stats.length - 1 && styles.lastStatCard,
              ]}
              onPress={() => onFieldPress(stat.id)}
              activeOpacity={0.7}
            >
              <View style={styles.statHeader}>
                <Text style={styles.value}>{stat.value}</Text>
                <Ionicons name="pencil" size={14} color="#0098B3" />
              </View>
              <View style={styles.labelContainer}>
                <Ionicons name={stat.icon} size={16} color="#999999" />
                <Text style={styles.label}>{stat.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.fieldsSection}>
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
              {index < fields.length - 1 && (
                <View style={styles.fieldDivider} />
              )}
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
  statsSection: {
    padding: Sizes.md,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Sizes.sm,
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
  },
  lastStatCard: {
    borderRightWidth: 0,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Sizes.xs,
  },
  value: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginRight: Sizes.xs,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#999999",
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: Sizes.sm,
  },
  fieldsSection: {
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
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#999999",
  },
  fieldDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: Sizes.sm,
  },
});

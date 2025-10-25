import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function SettingsSection({
  onMedicalHistory,
  onPrivacyPreferences,
  onHelpSupport,
}) {
  const settings = [
    {
      id: "medicalHistory",
      label: "Medical History",
      onPress: onMedicalHistory,
    },
    {
      id: "privacyPreferences",
      label: "Privacy Preferences",
      onPress: onPrivacyPreferences,
    },
    {
      id: "helpSupport",
      label: "Help & Support",
      onPress: onHelpSupport,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Settings</Text>

      <View style={styles.card}>
        {settings.map((setting, index) => (
          <TouchableOpacity
            key={setting.id}
            style={[
              styles.settingItem,
              index === settings.length - 1 && styles.lastSettingItem,
            ]}
            onPress={setting.onPress}
          >
            <Text style={styles.settingLabel}>{setting.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: Sizes.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
  },
});




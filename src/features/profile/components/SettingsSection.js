import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function SettingsSection({ onMedicalHistory, onPrivacyPreferences, onHelpSupport }) {
  const settings = [
    {
      id: 1,
      title: "Medical History",
      onPress: onMedicalHistory,
    },
    {
      id: 2,
      title: "Privacy Preferences",
      onPress: onPrivacyPreferences,
    },
    {
      id: 3,
      title: "Help & Support",
      onPress: onHelpSupport,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Settings</Text>
      
      <View style={styles.card}>
        {settings.map((setting, index) => (
          <View key={setting.id}>
            <TouchableOpacity style={styles.settingItem} onPress={setting.onPress}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
            </TouchableOpacity>
            {index < settings.length - 1 && <View style={styles.divider} />}
          </View>
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
    borderRadius: 8,
    padding: Sizes.md,
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Sizes.sm,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: Sizes.sm,
  },
});
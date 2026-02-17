import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function SettingsSection({
  onMedicalHistory,
  onPrivacyPreferences,
  onPrivacyPolicy,
  onContactUs,
}) {
  const settings = [
    {
      id: 2,
      title: "Privacy Preferences",
      onPress: onPrivacyPreferences,
    },
    {
      id: 3,
      title: "Privacy Policy",
      onPress: onPrivacyPolicy,
    },
    {
      id: 4,
      title: "Contact Us",
      onPress: onContactUs,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.content}>
          {settings.map((setting, index) => (
            <View key={setting.id}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={setting.onPress}
              >
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.grey}
                />
              </TouchableOpacity>
              {index < settings.length - 1 && <View style={styles.divider} />}
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginLeft: Sizes.sm,
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

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import SettingsHeader from "../components/SettingsHeader";
import SecuritySection from "../components/SecuritySection";
import SettingsSection from "../components/SettingsSection";
import RecentActivitySection from "../components/RecentActivitySection";

export default function ProfileSettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const handleMedicalHistory = () => {
    // Navigate to medical history
  };

  const handlePrivacyPreferences = () => {
    // Navigate to privacy preferences
  };

  const handleHelpSupport = () => {
    // Navigate to help & support
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SettingsHeader />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SecuritySection />

        <SettingsSection
          onMedicalHistory={handleMedicalHistory}
          onPrivacyPreferences={handlePrivacyPreferences}
          onHelpSupport={handleHelpSupport}
        />

        <RecentActivitySection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.lg,
  },
});




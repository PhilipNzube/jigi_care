import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  AppState,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { OneSignal } from "react-native-onesignal";
import { showInfo } from "../../../shared/utils/toast";

export default function PrivacyPreferencesScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const appState = useRef(AppState.currentState);

  // Check notification permission status
  const checkNotificationPermission = async () => {
    try {
      // getPermissionAsync returns a boolean for granted status in OneSignal v5
      const granted = await OneSignal.Notifications.getPermissionAsync();
      setNotificationsEnabled(granted);
    } catch (error) {
      console.error("Error checking notification permission:", error);
    }
  };

  useEffect(() => {
    // Initial check
    checkNotificationPermission();

    // Listen for app state changes to refresh status when returning from settings
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        checkNotificationPermission();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleNotificationToggle = async () => {
    // Check current status
    const granted = await OneSignal.Notifications.getPermissionAsync();

    // If permission not determined/not requested, status might be different in native, 
    // but OneSignal v5 requestPermission(true) handles the prompt.
    // However, if already granted or denied, oneSignal.Notifications.requestPermission(true)
    // might not show prompt again on iOS.
    
    // We'll try to request first if not enabled
    if (!granted) {
      const result = await OneSignal.Notifications.requestPermission(true);
      if (result) {
        setNotificationsEnabled(true);
        return;
      }
    }

    // If we're here, it means either:
    // 1. It was already granted and user wants to turn it off -> Open Settings
    // 2. It was denied and requestPermission didn't show prompt/was rejected -> Open Settings
    Linking.openSettings();
  };

  const handleFeatureNotAvailable = (featureName) => {
    showInfo(
      `The "${featureName}" feature is coming soon! Our team is working hard to bring it to you.`,
      "Coming Soon"
    );
  };

  const privacySettings = [
    {
      id: 1,
      title: "Push Notifications",
      description: "Receive push notifications on your device",
      value: notificationsEnabled,
      onValueChange: handleNotificationToggle,
    },
  ];

  const privacyActions = [
    {
      id: 1,
      title: "Download My Data",
      icon: "download-outline",
      description: "Request a copy of your data",
      onPress: () => handleFeatureNotAvailable("Download My Data"),
    },
    {
      id: 2,
      title: "Delete Account",
      icon: "trash-outline",
      description: "Permanently delete your account",
      danger: true,
      onPress: () => handleFeatureNotAvailable("Delete Account"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Preferences</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          <View style={styles.card}>
            {privacySettings.map((setting, index) => (
              <View key={setting.id}>
                <View style={styles.settingItem}>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{setting.title}</Text>
                    <Text style={styles.settingDescription}>
                      {setting.description}
                    </Text>
                  </View>
                  <Switch
                    value={setting.value}
                    onValueChange={setting.onValueChange}
                    trackColor={{ false: "#E0E0E0", true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>
                {index < privacySettings.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.card}>
            {privacyActions.map((action, index) => (
              <View key={action.id}>
                <TouchableOpacity 
                  style={styles.actionItem}
                  onPress={action.onPress}
                >
                  <View style={styles.actionLeft}>
                    <Ionicons
                      name={action.icon}
                      size={24}
                      color={action.danger ? "#EA4D4D" : Colors.primary}
                    />
                    <View style={styles.actionText}>
                      <Text
                        style={[
                          styles.actionTitle,
                          action.danger && styles.dangerText,
                        ]}
                      >
                        {action.title}
                      </Text>
                      <Text style={styles.actionDescription}>
                        {action.description}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
                {index < privacyActions.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    backgroundColor: "#F5F5F5",
    position: "relative",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: Sizes.lg,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
  },
  section: {
    marginBottom: Sizes.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.md,
  },
  settingText: {
    flex: 1,
    marginRight: Sizes.md,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginLeft: Sizes.md,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.md,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  actionText: {
    marginLeft: Sizes.md,
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  actionDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  dangerText: {
    color: "#EA4D4D",
  },
});


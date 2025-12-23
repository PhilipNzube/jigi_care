import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommonActions } from "@react-navigation/native";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import { useAuth } from "../../../shared/context/AuthContext";
import LoadingOverlay from "../../../shared/components/LoadingOverlay";
import { showError } from "../../../shared/utils/toast";
import ProfileHeader from "../components/ProfileHeader";
import UserInfoCard from "../components/UserInfoCard";
import HealthMetricsSection from "../components/HealthMetricsSection";
import StatsCards from "../components/StatsCards";
import RecentActivitySection from "../components/RecentActivitySection";
import SecuritySection from "../components/SecuritySection";
import EmergencyContactsSection from "../components/EmergencyContactsSection";
import SettingsSection from "../components/SettingsSection";
import LogoutButton from "../components/LogoutButton";
import LogoutModal from "../modals/LogoutModal";

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  const handleSettings = () => {
    navigation.navigate("ProfileSettings");
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    setIsLoggingOut(true);
    console.log("🚪 [PROFILE SCREEN] User confirmed logout");
    
    try {
      // Sign out and clear all tokens
      await signOut();
      
      // Navigate to login screen - get root navigator since we're nested in MainAppNavigator
      // Try to get the root navigator, fallback to current navigation
      let rootNavigation = navigation;
      let parent = navigation.getParent();
      
      // Navigate up to find the root navigator (AppNavigator)
      while (parent) {
        rootNavigation = parent;
        parent = parent.getParent();
      }
      
      // Reset navigation stack to Login screen
      rootNavigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("❌ [PROFILE SCREEN] Error during logout:", error);
      // Show error to user
      showError(error.message || "Logout failed. Please try again.");
      
      // Still try to navigate to login even if there's an error
      // (local logout should have happened)
      let rootNavigation = navigation;
      let parent = navigation.getParent();
      while (parent) {
        rootNavigation = parent;
        parent = parent.getParent();
      }
      rootNavigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleMedicalHistory = () => {
    // Navigate to medical history
    console.log("Navigate to Medical History");
  };

  const handlePrivacyPreferences = () => {
    // Navigate to privacy preferences
    console.log("Navigate to Privacy Preferences");
  };

  const handleHelpSupport = () => {
    // Navigate to help & support
    console.log("Navigate to Help & Support");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground source={Images.bgImg} style={styles.backgroundImage}>
          <ProfileHeader onSettings={handleSettings} />
          <UserInfoCard onEdit={handleEditProfile} />
          <HealthMetricsSection />
        </ImageBackground>

        <View style={styles.content}>
          <StatsCards />
          <SecuritySection />
          <SettingsSection
            onMedicalHistory={handleMedicalHistory}
            onPrivacyPreferences={handlePrivacyPreferences}
            onHelpSupport={handleHelpSupport}
          />
          <RecentActivitySection />
          <EmergencyContactsSection />
          <LogoutButton onPress={handleLogout} />
        </View>
      </ScrollView>

      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
      <LoadingOverlay visible={isLoggingOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  backgroundImage: {
    height: 370,
  },
  content: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.lg,
    paddingBottom: Sizes.xl,
    marginTop: -24,
  },
});

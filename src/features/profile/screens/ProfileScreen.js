import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  BackHandler,
  Platform,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import { useAuth } from "../../../shared/context/AuthContext";
import { getToken } from "../../../shared/utils/storage";
import { getUserProfile } from "../../auth/services/authService";
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

export default function ProfileScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { signOut, updateUser } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Refresh when screen comes into focus (tab change)
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Silently refresh data if needed
    });

    return unsubscribe;
  }, [navigation]);

  // Handle back button - navigate to home
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (Platform.OS === 'android') {
          // Navigate to home tab using the tab navigation
          if (navigation.navigate) {
            navigation.navigate("BottomTabs", { screen: "home" });
          }
          return true; // Prevent default back behavior
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [navigation])
  );

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
      // Do NOT navigate to login if logout API call failed
      // User remains logged in
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

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh user profile data
      const token = await getToken();
      if (token) {
        const userData = await getUserProfile();
        await updateUser(userData);
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setRefreshing(false);
    }
  }, [updateUser]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  BackHandler,
  Platform,
  RefreshControl,
} from "react-native";
import {
  useSafeAreaInsets,
  SafeAreaView,
} from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { showWarning } from "../../../shared/utils/toast";

// Import components
import HeroSection from "../components/HeroSection";
import QuickActionsGrid from "../components/QuickActionsGrid";
import HealthTipsCarousel from "../components/HealthTipsCarousel";
// import UpcomingAppointmentsList from "../components/UpcomingAppointmentsList";
import FloatingActionButton from "../components/FloatingActionButton";
import ChatBotInterface from "../components/ChatBotInterface";
import PrivacyPolicyModal from "../../../shared/components/PrivacyPolicyModal";
import DeclineConfirmationModal from "../../../shared/components/DeclineConfirmationModal";
import LoadingOverlay from "../../../shared/components/LoadingOverlay";
import { useAuth } from "../../../shared/context/AuthContext";
import { calculateAge } from "../../../shared/utils/validationUtils";
import { updateProfile } from "../../auth/services/authService";
import storage from "../../../shared/utils/storage";

export default function HomeScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [showChatBotInterface, setShowChatBotInterface] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const refreshKeyRef = useRef(0);
  const backPressTimeoutRef = useRef(null);
  const warningShownRef = useRef(false);
  const { user, updateUser, signOut, refreshProfile } = useAuth();
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userAge = calculateAge(user?.dateOfBirth);
  const isUnder18 = userAge > 0 && userAge < 18;

  useEffect(() => {
    // Check if user has accepted the privacy policy locally
    const checkPolicy = async () => {
      const accepted = await storage.getPrivacyPolicyAccepted();
      if (!accepted) {
        setShowPolicyModal(true);
      }
    };
    
    if (user && !isLoggingOut) {
      checkPolicy();
    }
  }, [user, isLoggingOut]);

  // Logout transition logic
  const handleFinalDecline = async () => {
    setShowDeclineConfirm(false);
    setIsLoggingOut(true);
    
    // Slight delay for better UX before signing out
    setTimeout(async () => {
      await signOut();
    }, 1500);
  };

  const handleAcceptPolicy = async () => {
    try {
      if (isUnder18) {
        // Redirect to a specific consent form or show info
        navigation.navigate("ContactUs", { 
          subject: "Parental Consent Request",
          message: `I would like to request parental consent for account: ${user?.email}`
        });
        return;
      }

      // Store locally as requested by the user
      await storage.storePrivacyPolicyAccepted(true);
      setShowPolicyModal(false);
    } catch (error) {
       console.error("Error accepting privacy policy:", error);
    }
  };

  const handleRejectPolicy = async () => {
     // Show confirmation bottom sheet instead of moving straight to logout
     setShowPolicyModal(false);
     setShowDeclineConfirm(true);
  };

  const handleCancelDecline = () => {
    setShowDeclineConfirm(false);
    setShowPolicyModal(true);
  };

  // Refresh when screen comes into focus (tab change or back navigation)
  useFocusEffect(
    React.useCallback(() => {
      // Silently refresh data if needed
      refreshKeyRef.current += 1;
      
      // Reset warning when screen comes into focus
      warningShownRef.current = false;
      if (backPressTimeoutRef.current) {
        clearTimeout(backPressTimeoutRef.current);
        backPressTimeoutRef.current = null;
      }
      
      // Pro-like background refresh: Ensure notification counts/profile stay perfectly synced
      if (refreshProfile) {
        refreshProfile();
      }
    }, [refreshProfile])
  );

  // Handle back button on Android
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (Platform.OS === "android") {
          if (!warningShownRef.current) {
            // First press: show warning
            warningShownRef.current = true;
            showWarning("Press back again to exit", "Exit App");

            // Reset warning after 2 seconds
            backPressTimeoutRef.current = setTimeout(() => {
              warningShownRef.current = false;
            }, 2000);

            return true; // Prevent default back behavior
          } else {
            // Second press: exit app
            BackHandler.exitApp();
            return true;
          }
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => {
        subscription.remove();
        if (backPressTimeoutRef.current) {
          clearTimeout(backPressTimeoutRef.current);
        }
      };
    }, [])
  );

  const handleChatPress = () => {
    console.log("Chat button pressed, isChatMode:", isChatMode);
    if (isChatMode) {
      // Close chat and return to normal state
      console.log("Closing chat bot interface");
      setShowChatBotInterface(false);
      setIsChatMode(false);
    } else {
      // Open chat instantly
      console.log("Opening chat bot interface");
      setShowChatBotInterface(true);
      setIsChatMode(true);
    }
  };

  const handleCloseChat = () => {
    setShowChatBotInterface(false);
    setIsChatMode(false);
    // Navigation will handle going back if needed
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Trigger refresh in child components
    refreshKeyRef.current += 1;
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  console.log(
    "HomeScreen render - showChatBotInterface:",
    showChatBotInterface,
    "isChatMode:",
    isChatMode
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <HeroSection insets={insets} navigation={navigation} />
        <QuickActionsGrid navigation={navigation} />
        <HealthTipsCarousel navigation={navigation} />
        {/* Upcoming appointments section - commented out
        <UpcomingAppointmentsList
          navigation={navigation}
          refreshKey={refreshKeyRef.current}
        />
        */}
      </ScrollView>
      <FloatingActionButton onPress={handleChatPress} isChatMode={isChatMode} />

      <ChatBotInterface
        visible={showChatBotInterface}
        onClose={handleCloseChat}
      />

      <PrivacyPolicyModal
        visible={showPolicyModal}
        isUnder18={isUnder18}
        onAccept={handleAcceptPolicy}
        onReject={handleRejectPolicy}
      />

      <DeclineConfirmationModal 
        visible={showDeclineConfirm}
        onContinue={handleFinalDecline}
        onCancel={handleCancelDecline}
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
});

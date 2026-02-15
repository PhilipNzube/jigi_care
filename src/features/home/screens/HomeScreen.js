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

export default function HomeScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [showChatBotInterface, setShowChatBotInterface] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const refreshKeyRef = useRef(0);
  const backPressTimeoutRef = useRef(null);
  const warningShownRef = useRef(false);

  // Refresh when screen comes into focus (tab change)
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // Silently refresh data if needed
      refreshKeyRef.current += 1;
      // Reset warning when screen comes into focus
      warningShownRef.current = false;
      if (backPressTimeoutRef.current) {
        clearTimeout(backPressTimeoutRef.current);
        backPressTimeoutRef.current = null;
      }
    });

    return unsubscribe;
  }, [navigation]);

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

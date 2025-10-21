import React, { useState } from "react";
import { View, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import components
import HeroSection from "../components/HeroSection";
import QuickActionsGrid from "../components/QuickActionsGrid";
import HealthTipsCarousel from "../components/HealthTipsCarousel";
import UpcomingAppointmentsList from "../components/UpcomingAppointmentsList";
import FloatingActionButton from "../components/FloatingActionButton";
import ConnectingModal from "../components/ConnectingModal";
import ChatBotInterface from "../components/ChatBotInterface";

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [showConnectingModal, setShowConnectingModal] = useState(false);
  const [showChatBotInterface, setShowChatBotInterface] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);

  const handleChatPress = () => {
    console.log("Chat button pressed, isChatMode:", isChatMode);
    if (isChatMode) {
      // Close chat and return to normal state
      console.log("Closing chat bot interface");
      setShowChatBotInterface(false);
      setIsChatMode(false);
    } else {
      // Show connecting modal first
      console.log("Showing connecting modal");
      setShowConnectingModal(true);

      // After 3 seconds, hide connecting modal and show chat bot interface
      setTimeout(() => {
        console.log("Transitioning to chat bot interface");
        setShowConnectingModal(false);
        setShowChatBotInterface(true);
        setIsChatMode(true);
      }, 3000);
    }
  };

  const handleCloseChat = () => {
    setShowChatBotInterface(false);
    setIsChatMode(false);
  };

  console.log(
    "HomeScreen render - showConnectingModal:",
    showConnectingModal,
    "showChatBotInterface:",
    showChatBotInterface,
    "isChatMode:",
    isChatMode
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <HeroSection insets={insets} navigation={navigation} />
        <QuickActionsGrid />
        <HealthTipsCarousel />
        <UpcomingAppointmentsList />
      </ScrollView>
      <FloatingActionButton onPress={handleChatPress} isChatMode={isChatMode} />

      <ConnectingModal visible={showConnectingModal} doctorName="Dr. Sarah" />

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

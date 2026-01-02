import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, BackHandler, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Colors, Sizes } from "../../../shared/constants";
import MedicationHeader from "../components/MedicationHeader";
import TabNavigation from "../components/TabNavigation";
import PrescriptionsTab from "../components/PrescriptionsTab";
import OrderTab from "../components/OrderTab";
import HistoryTab from "../components/HistoryTab";

export default function MedicationScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  // Get initial tab from route params, default to "Prescriptions"
  const initialTab = route?.params?.initialTab || "Prescriptions";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update active tab when route params change
  useEffect(() => {
    if (route?.params?.initialTab && route.params.initialTab !== activeTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);

  // Refresh when screen comes into focus (tab change)
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // Silently refresh - tabs will handle their own refresh
      // Also check if we need to update tab from params
      if (route?.params?.initialTab && route.params.initialTab !== activeTab) {
        setActiveTab(route.params.initialTab);
      }
    });

    return unsubscribe;
  }, [navigation, route?.params?.initialTab, activeTab]);

  // Handle back button - navigate to home
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (Platform.OS === "android") {
          // Navigate to home tab using the tab navigation
          if (navigation.navigate) {
            navigation.navigate("BottomTabs", { screen: "home" });
          }
          return true; // Prevent default back behavior
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [navigation])
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Prescriptions":
        return <PrescriptionsTab navigation={navigation} />;
      case "Order":
        return <OrderTab navigation={navigation} />;
      case "History":
        return <HistoryTab navigation={navigation} />;
      default:
        return <PrescriptionsTab navigation={navigation} />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <MedicationHeader />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      {renderTabContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
});

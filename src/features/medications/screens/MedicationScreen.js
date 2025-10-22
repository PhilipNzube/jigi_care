import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import MedicationHeader from "../components/MedicationHeader";
import TabNavigation from "../components/TabNavigation";
import PrescriptionsTab from "../components/PrescriptionsTab";
import OrderTab from "../components/OrderTab";
import HistoryTab from "../components/HistoryTab";

export default function MedicationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("Prescriptions");

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

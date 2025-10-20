import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

// Import screens
import HomeScreen from "../../features/home/screens/HomeScreen";
import ConsultScreen from "../../features/consult/screens/ConsultScreen";
import MedicationScreen from "../../features/medications/screens/MedicationScreen";
import ProfileScreen from "../../features/profile/screens/ProfileScreen";

export default function MainAppNavigator() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("home");

  const tabs = [
    {
      id: "home",
      label: "Home",
      icon: "home-outline",
      activeIcon: "home",
      component: HomeScreen,
    },
    {
      id: "consult",
      label: "Consult",
      icon: "calendar-outline",
      activeIcon: "calendar",
      component: ConsultScreen,
    },
    {
      id: "medication",
      label: "Medication",
      icon: "medical-outline",
      activeIcon: "medical",
      component: MedicationScreen,
    },
    {
      id: "profile",
      label: "Profile",
      icon: "person-outline",
      activeIcon: "person",
      component: ProfileScreen,
    },
  ];

  const renderBottomNavigation = () => (
    <View style={[styles.bottomNavigation, { paddingBottom: insets.bottom }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.navItem}
          onPress={() => setActiveTab(tab.id)}
        >
          <Ionicons
            name={activeTab === tab.id ? tab.activeIcon : tab.icon}
            size={24}
            color={activeTab === tab.id ? Colors.primary : Colors.textSecondary}
          />
          <Text
            style={[
              styles.navLabel,
              {
                color:
                  activeTab === tab.id ? Colors.primary : Colors.textSecondary,
              },
            ]}
          >
            {tab.label}
          </Text>
          {activeTab === tab.id && <View style={styles.navIndicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );

  const ActiveComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || HomeScreen;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActiveComponent />
      </View>
      {renderBottomNavigation()}
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
  },
  bottomNavigation: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingTop: Sizes.sm,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Sizes.sm,
  },
  navLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    marginTop: 4,
  },
  navIndicator: {
    position: "absolute",
    bottom: 0,
    width: 20,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
  },
});

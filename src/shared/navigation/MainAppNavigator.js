import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../constants";
import { Images } from "../utils/imageUtils";

// Import screens
import HomeScreen from "../../features/home/screens/HomeScreen";
import ConsultScreen from "../../features/consult/screens/ConsultScreen";
import MedicationScreen from "../../features/medications/screens/MedicationScreen";
import ProfileScreen from "../../features/profile/screens/ProfileScreen";
import DoctorProfileScreen from "../../features/consult/screens/DoctorProfileScreen";
import BookConsultationScreen from "../../features/consult/screens/BookConsultationScreen";
import ChatPage from "../../features/consult/screens/ChatPage";
import VoiceCallPage from "../../features/consult/screens/VoiceCallPage";
import VideoCallPage from "../../features/consult/screens/VideoCallPage";
import ConsultationSummaryPage from "../../features/consult/screens/ConsultationSummaryPage";
import PaymentMethodScreen from "../../features/payment/screens/PaymentMethodScreen";
import CardPaymentScreen from "../../features/payment/screens/CardPaymentScreen";
import BankTransferScreen from "../../features/payment/screens/BankTransferScreen";
import USSDPaymentScreen from "../../features/payment/screens/USSDPaymentScreen";
import CartScreen from "../../features/medications/screens/CartScreen";
import ShippingAddressScreen from "../../features/medications/screens/ShippingAddressScreen";
import OrderDetailsModal from "../../features/medications/modals/OrderDetailsModal";
import EditProfileScreen from "../../features/profile/screens/EditProfileScreen";
import ProfileSettingsScreen from "../../features/profile/screens/ProfileSettingsScreen";
import HealthMonitoringScreen from "../../features/health/screens/HealthMonitoringScreen";
import AddReadingScreen from "../../features/health/screens/AddReadingScreen";
import BloodPressureBottomSheet from "../../features/health/components/BloodPressureBottomSheet";
import TemperatureBottomSheet from "../../features/health/components/TemperatureBottomSheet";
import WeightBottomSheet from "../../features/health/components/WeightBottomSheet";
import HeartRateBottomSheet from "../../features/health/components/HeartRateBottomSheet";
import LabTestScreen from "../../features/health/screens/LabTestScreen";
import BookLabTestScreen from "../../features/health/screens/BookLabTestScreen";
import LabResultsScreen from "../../features/health/screens/LabResultsScreen";
import TestResultDetailsScreen from "../../features/health/screens/TestResultDetailsScreen";

const Stack = createStackNavigator();

// Bottom Tab Navigator Component
function BottomTabNavigator({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("home");

  // Handle tab switching from navigation params
  React.useEffect(() => {
    if (route?.params?.screen) {
      setActiveTab(route.params.screen);
    }
  }, [route?.params?.screen]);

  const tabs = [
    {
      id: "home",
      label: "Home",
      icon: Images.homeIcon,
      activeIcon: Images.homeIconActive,
      component: HomeScreen,
    },
    {
      id: "consult",
      label: "Consult",
      icon: Images.consultIcon,
      activeIcon: Images.consultIconActive,
      component: ConsultScreen,
    },
    {
      id: "medication",
      label: "Medication",
      icon: Images.medicationIcon,
      activeIcon: Images.medicationIconActive,
      component: MedicationScreen,
    },
    {
      id: "profile",
      label: "Profile",
      icon: Images.profileIcon,
      activeIcon: Images.profileIconActive,
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
          <Image
            source={activeTab === tab.id ? tab.activeIcon : tab.icon}
            style={styles.navIcon}
            resizeMode="contain"
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
        <ActiveComponent navigation={navigation} />
      </View>
      {renderBottomNavigation()}
    </View>
  );
}

export default function MainAppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BottomTabs" component={BottomTabNavigator} />
      <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
      <Stack.Screen
        name="BookConsultation"
        component={BookConsultationScreen}
      />
      <Stack.Screen name="ChatPage" component={ChatPage} />
      <Stack.Screen name="VoiceCall" component={VoiceCallPage} />
      <Stack.Screen name="VideoCall" component={VideoCallPage} />
      <Stack.Screen
        name="ConsultationSummary"
        component={ConsultationSummaryPage}
      />
      <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <Stack.Screen name="CardPayment" component={CardPaymentScreen} />
      <Stack.Screen name="BankTransfer" component={BankTransferScreen} />
      <Stack.Screen name="USSDPayment" component={USSDPaymentScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="ShippingAddress" component={ShippingAddressScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsModal} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
      <Stack.Screen
        name="HealthMonitoring"
        component={HealthMonitoringScreen}
      />
      <Stack.Screen name="AddReading" component={AddReadingScreen} />
      <Stack.Screen
        name="BloodPressureBottomSheet"
        component={BloodPressureBottomSheet}
      />
      <Stack.Screen
        name="TemperatureBottomSheet"
        component={TemperatureBottomSheet}
      />
      <Stack.Screen name="WeightBottomSheet" component={WeightBottomSheet} />
      <Stack.Screen
        name="HeartRateBottomSheet"
        component={HeartRateBottomSheet}
      />
      <Stack.Screen name="LabTest" component={LabTestScreen} />
      <Stack.Screen name="BookLabTest" component={BookLabTestScreen} />
      <Stack.Screen name="LabResults" component={LabResultsScreen} />
      <Stack.Screen
        name="TestResultDetails"
        component={TestResultDetailsScreen}
      />
    </Stack.Navigator>
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
  navIcon: {
    width: 24,
    height: 24,
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

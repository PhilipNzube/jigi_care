import React, { useEffect, useRef } from "react";
import { DeviceEventEmitter } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { navigationRef } from "./navigationRef";
import { useAuth } from "../../shared/context/AuthContext";
import { setPendingNavigation } from "./navigationRef";

// Import screens
import OnboardingScreen from "../../features/onboarding/screens/OnboardingScreen";
import WelcomeScreen from "../../features/onboarding/screens/WelcomeScreen";
import LoginScreen from "../../features/auth/screens/LoginScreen";
import SignUpScreen from "../../features/auth/screens/SignUpScreen";
import ForgotPasswordScreen from "../../features/auth/screens/ForgotPasswordScreen";
import EmailVerificationScreen from "../../features/auth/screens/EmailVerificationScreen";
import CreateNewPasswordScreen from "../../features/auth/screens/CreateNewPasswordScreen";
import PersonalizationScreen from "../../features/auth/screens/PersonalizationScreen";
import MainAppNavigator from "./MainAppNavigator";
import NotificationsScreen from "../../features/notifications/screens/NotificationsScreen";

import callKeepService from "../services/callKeepService";

const Stack = createStackNavigator();

function AppNavigatorContent() {
  const { isLoading, isAuthenticated } = useAuth();
  const pendingCallRef = useRef(null);

  // Listen for call answered from terminated state (cold-start)
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      "callAnsweredFromTerminated",
      (callParams) => {
        console.log("📞 [APP NAVIGATOR] Received callAnsweredFromTerminated:", callParams);
        pendingCallRef.current = callParams;
      }
    );
    return () => sub.remove();
  }, []);

  // Once auth resolves and stack is ready, execute pending call navigation
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    let timerId;
    const processPendingCall = async () => {
      let callParams = pendingCallRef.current;
      pendingCallRef.current = null;

      // Check persistent record if ref was not populated
      if (!callParams) {
        callParams = await callKeepService.getAndClearPendingAnsweredCall();
      }

      if (callParams) {
        console.log("📞 [APP NAVIGATOR] Processing pending call navigation:", callParams);
        const navParams = {
          ...callParams,
          isIncoming: true,
          autoAccept: true,
        };
        setPendingNavigation("ChatPage", navParams);

        if (navigationRef.isReady()) {
          try {
            navigationRef.navigate("ChatPage", navParams);
          } catch (e) {
            console.warn("⚠️ [APP NAVIGATOR] Direct navigate failed, pending nav will handle it:", e?.message);
          }
        }
      }
    };

    timerId = setTimeout(processPendingCall, 500);
    return () => clearTimeout(timerId);
  }, [isLoading, isAuthenticated]);

  // Don't render navigator until we know auth status
  // This prevents any flash of onboarding screen
  if (isLoading) {
    return null; // Keep splash screen visible
  }

  // Determine initial route based on authentication status
  const initialRouteName = isAuthenticated ? "MainApp" : "Onboarding";

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen
        name="EmailVerification"
        component={EmailVerificationScreen}
      />
      <Stack.Screen
        name="CreateNewPassword"
        component={CreateNewPasswordScreen}
      />
      <Stack.Screen name="Personalization" component={PersonalizationScreen} />
      <Stack.Screen
        name="MainApp"
        component={MainAppNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style="auto" />
        <AppNavigatorContent />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

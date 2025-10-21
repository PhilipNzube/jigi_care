import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Import screens
import AppSplashScreen from "../../features/onboarding/screens/AppSplashScreen";
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

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Splash" component={AppSplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen
            name="EmailVerification"
            component={EmailVerificationScreen}
          />
          <Stack.Screen
            name="CreateNewPassword"
            component={CreateNewPasswordScreen}
          />
          <Stack.Screen
            name="Personalization"
            component={PersonalizationScreen}
          />
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
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

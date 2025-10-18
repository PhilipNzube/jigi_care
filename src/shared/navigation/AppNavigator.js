import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Import screens
import AppSplashScreen from "../../features/onboarding/screens/AppSplashScreen";
import OnboardingScreen from "../../features/onboarding/screens/OnboardingScreen";
import WelcomeScreen from "../../features/onboarding/screens/WelcomeScreen";
import HomeScreen from "../../features/profile/screens/HomeScreen";
import ProfileScreen from "../../features/profile/screens/ProfileScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  useEffect(() => {
    // Check if this is the first app launch
    // In a real app, you'd check AsyncStorage or similar
    // For now, we'll simulate this
    const checkFirstLaunch = async () => {
      // Simulate checking user preferences
      setTimeout(() => {
        setIsFirstLaunch(false);
      }, 3000);
    };

    checkFirstLaunch();
  }, []);

  if (isFirstLaunch) {
    return (
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={AppSplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: "#2196F3",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "JijiCare" }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: "Profile" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

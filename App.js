import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import Toast from "react-native-toast-message";
import AppNavigator from "./src/shared/navigation/AppNavigator";
import { AuthProvider, useAuth } from "./src/shared/context/AuthContext";
import { configureGoogleSignIn } from "./src/features/auth/services/googleSignInService";
import { GOOGLE_WEB_CLIENT_ID } from "./src/shared/config/googleConfig";
import { loadFonts } from "./src/shared/utils/fontUtils";
import { resetToLogin } from "./src/shared/navigation/navigationRef";

// Keep the native splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    const init = async () => {
      if (!isLoading) {
        try {
          // Pre-load fonts
          await loadFonts();

          // Small delay for better UX (only if authenticated to ensure smooth transition)
          if (isAuthenticated) {
            // If authenticated, hide splash immediately after fonts load
            await SplashScreen.hideAsync();
          } else {
            // If not authenticated, small delay before showing onboarding
            await new Promise((resolve) => setTimeout(resolve, 300));
            await SplashScreen.hideAsync();
          }
        } catch (error) {
          console.error("Error during initialization:", error);
          await SplashScreen.hideAsync();
        }
      }
    };

    init();
  }, [isLoading, isAuthenticated]);

  return <AppNavigator />;
}

export default function App() {
  useEffect(() => {
    const init = async () => {
      // Configure Google Sign-In
      try {
        await configureGoogleSignIn(GOOGLE_WEB_CLIENT_ID);
      } catch (error) {
        console.error("Failed to configure Google Sign-In:", error);
      }
    };

    init();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
        <Toast />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

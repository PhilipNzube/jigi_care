import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import Toast, { BaseToast } from "react-native-toast-message";
import AppNavigator from "./src/shared/navigation/AppNavigator";
import { AuthProvider, useAuth } from "./src/shared/context/AuthContext";
import { configureGoogleSignIn } from "./src/features/auth/services/googleSignInService";
import { GOOGLE_WEB_CLIENT_ID } from "./src/shared/config/googleConfig";
import { loadFonts } from "./src/shared/utils/fontUtils";
import { resetToLogin } from "./src/shared/navigation/navigationRef";
import oneSignalService from "./src/shared/services/onesignalService";
import callKeepService from "./src/shared/services/callKeepService";

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

          // Request CallKeep permissions safely when activity window is attached
          try {
            await callKeepService.requestPermissions();
          } catch (pe) {
            console.warn("⚠️ Failed to request call permissions during startup:", pe);
          }

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

      // Initialize OneSignal
      try {
        await oneSignalService.initialize();
      } catch (error) {
        console.error("Failed to initialize OneSignal:", error);
      }
    };

    init();
  }, []);

  // Custom toast config: show full messages (no ellipsis), allow height to grow
  const toastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        text1NumberOfLines={0}
        text2NumberOfLines={0}
        style={[props.style, { minHeight: 60, height: undefined }]}
        text1Style={{ includeFontPadding: false, textAlignVertical: "center" }}
        text2Style={{ includeFontPadding: false, textAlignVertical: "center" }}
      />
    ),
    error: (props) => (
      <BaseToast
        {...props}
        text1NumberOfLines={0}
        text2NumberOfLines={0}
        style={[
          props.style,
          { borderLeftColor: "#F44336", minHeight: 60, height: undefined },
        ]}
        text1Style={{ includeFontPadding: false, textAlignVertical: "center" }}
        text2Style={{ includeFontPadding: false, textAlignVertical: "center" }}
      />
    ),
    info: (props) => (
      <BaseToast
        {...props}
        text1NumberOfLines={0}
        text2NumberOfLines={0}
        style={[props.style, { minHeight: 60, height: undefined }]}
        text1Style={{ includeFontPadding: false, textAlignVertical: "center" }}
        text2Style={{ includeFontPadding: false, textAlignVertical: "center" }}
      />
    ),
  };

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
        <Toast config={toastConfig} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RNBootSplash from "react-native-bootsplash";
import Toast from "react-native-toast-message";
import AppNavigator from "./src/shared/navigation/AppNavigator";
import { AuthProvider } from "./src/shared/context/AuthContext";
import { configureGoogleSignIn } from "./src/features/auth/services/googleSignInService";
import { GOOGLE_WEB_CLIENT_ID } from "./src/shared/config/googleConfig";

export default function App() {
  useEffect(() => {
    const init = async () => {
      // Configure Google Sign-In
      try {
        await configureGoogleSignIn(GOOGLE_WEB_CLIENT_ID);
      } catch (error) {
        console.error("Failed to configure Google Sign-In:", error);
      }

      // Hide the splash screen after app initialization
      RNBootSplash.hide({ fade: true });
    };

    init();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <Toast />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

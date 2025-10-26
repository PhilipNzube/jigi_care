import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RNBootSplash from "react-native-bootsplash";
import AppNavigator from "./src/shared/navigation/AppNavigator";

export default function App() {
  useEffect(() => {
    const init = async () => {
      // Hide the splash screen after app initialization
      RNBootSplash.hide({ fade: true });
    };

    init();
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

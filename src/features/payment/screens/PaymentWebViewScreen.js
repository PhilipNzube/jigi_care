import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { verifyPayment } from "../services/paymentService";
import { showError, showSuccess } from "../../../shared/utils/toast";

export default function PaymentWebViewScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { authorizationUrl, reference, callbackUrl } = route.params || {};
  const webViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasVerified, setHasVerified] = useState(false);

  // Handle Android back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Close the WebView and go back
        navigation.goBack();
        return true;
      };

      if (Platform.OS === "android") {
        BackHandler.addEventListener("hardwareBackPress", onBackPress);
        return () => {
          BackHandler.removeEventListener("hardwareBackPress", onBackPress);
        };
      }
    }, [navigation])
  );

  const handleNavigationStateChange = async (navState) => {
    const { url } = navState;

    if (!url) return;

    console.log("🌐 [PAYMENT WEBVIEW] Navigation to:", url);

    // Check if payment was successful (redirected to callback URL or any success indicator)
    // Paystack redirects to callback URL on success, or we can check for success patterns
    const isSuccessUrl = callbackUrl 
      ? url.includes(callbackUrl) 
      : url.includes("success") || url.includes("callback") || url.includes("verify");
    
    if (isSuccessUrl) {
      console.log("✅ [PAYMENT WEBVIEW] Payment successful, verifying...");
      
      if (!hasVerified && reference) {
        setHasVerified(true);
        setIsLoading(true);
        
        try {
          const verificationResult = await verifyPayment(reference);
          
          if (verificationResult.success && verificationResult.data?.status === "success") {
            console.log("✅ [PAYMENT WEBVIEW] Payment verified successfully!");
            showSuccess("Payment successful!");
            
            // Navigate back to consult screen
            setTimeout(() => {
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "BottomTabs",
                    params: { screen: "Consult" },
                  },
                ],
              });
            }, 1000);
          } else {
            throw new Error("Payment verification failed");
          }
        } catch (error) {
          console.error("❌ [PAYMENT WEBVIEW] Payment verification error:", error);
          showError("Payment verification failed. Please contact support.");
          navigation.goBack();
        } finally {
          setIsLoading(false);
        }
      }
    }

    // Handle 3DS close redirect
    if (url === "https://standard.paystack.co/close") {
      console.log("🔄 [PAYMENT WEBVIEW] 3DS close detected, continuing...");
      // Continue processing - the callback URL should be hit next
    }
  };

  if (!authorizationUrl) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0098B3" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0098B3" />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: authorizationUrl }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0098B3" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    zIndex: 1,
  },
});


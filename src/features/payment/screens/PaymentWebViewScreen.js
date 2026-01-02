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
import { useFocusEffect, CommonActions } from "@react-navigation/native";
import { verifyPayment } from "../services/paymentService";
import { showError, showSuccess } from "../../../shared/utils/toast";

export default function PaymentWebViewScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { authorizationUrl, reference, callbackUrl, source } =
    route.params || {};
  const webViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasVerifiedRef = useRef(false); // Use ref to prevent multiple verifications
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
        const backHandler = BackHandler.addEventListener(
          "hardwareBackPress",
          onBackPress
        );
        return () => {
          backHandler.remove();
        };
      }
    }, [navigation])
  );

  const handleNavigationStateChange = async (navState) => {
    const { url } = navState;

    if (!url || hasVerifiedRef.current) {
      return; // Don't process if already verified
    }

    console.log("🌐 [PAYMENT WEBVIEW] Navigation to:", url);

    // Extract reference from URL if not provided
    let paymentReference = reference;
    if (!paymentReference && url) {
      const referenceMatch = url.match(/[?&](?:reference|trxref)=([^&]+)/);
      if (referenceMatch) {
        paymentReference = decodeURIComponent(referenceMatch[1]);
        console.log(
          "🔍 [PAYMENT WEBVIEW] Extracted reference from URL:",
          paymentReference
        );
      }
    }

    // Check if payment was successful (redirected to callback URL)
    // Paystack redirects to callback URL on success
    const isCallbackUrl =
      url.includes("/payments/callback") ||
      url.includes("callback-test") ||
      url.includes("callback") ||
      (callbackUrl && url.includes(callbackUrl)) ||
      url.includes("success") ||
      url.includes("verify");

    // Also check for Paystack close URL (3DS completion)
    const isPaystackClose =
      url === "https://standard.paystack.co/close" ||
      url.includes("standard.paystack.co/close");

    if (isCallbackUrl || isPaystackClose) {
      console.log(
        "✅ [PAYMENT WEBVIEW] Callback detected, verifying payment..."
      );

      if (!hasVerifiedRef.current && paymentReference) {
        hasVerifiedRef.current = true; // Set immediately to prevent multiple calls
        setHasVerified(true);
        setIsLoading(true);

        try {
          console.log(
            "🔍 [PAYMENT WEBVIEW] Verifying payment with reference:",
            paymentReference
          );
          const verificationResult = await verifyPayment(paymentReference);

          console.log(
            "📋 [PAYMENT WEBVIEW] Verification result:",
            JSON.stringify(verificationResult, null, 2)
          );

          if (
            verificationResult.success &&
            verificationResult.data?.status === "success"
          ) {
            console.log("✅ [PAYMENT WEBVIEW] Payment verified successfully!");
            showSuccess("Payment successful!");

            // Close WebView and navigate based on source
            setTimeout(() => {
              if (source === "BookLabTest") {
                // Navigate to ViewAllTests if came from BookLabTest
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      {
                        name: "ViewAllTests",
                      },
                    ],
                  })
                );
                console.log(
                  "✅ [PAYMENT WEBVIEW] Navigated to ViewAllTests screen"
                );
              } else if (source === "Medication") {
                // Navigate to Medication tab with Order tab active
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      {
                        name: "BottomTabs",
                        params: {
                          screen: "medication",
                          params: {
                            initialTab: "Order",
                          },
                        },
                      },
                    ],
                  })
                );
                console.log(
                  "✅ [PAYMENT WEBVIEW] Navigated to Medication screen with Order tab"
                );
              } else {
                // Default: Reset navigation stack and navigate to Consult tab
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      {
                        name: "BottomTabs",
                        params: {
                          screen: "consult", // Match the tab ID from BottomTabNavigator
                        },
                      },
                    ],
                  })
                );
                console.log("✅ [PAYMENT WEBVIEW] Navigated to Consult screen");
              }
            }, 1500);
          } else {
            console.warn(
              "⚠️ [PAYMENT WEBVIEW] Payment verification returned non-success status"
            );
            throw new Error("Payment verification failed");
          }
        } catch (error) {
          console.error(
            "❌ [PAYMENT WEBVIEW] Payment verification error:",
            error
          );
          showError(
            error.message ||
              "Payment verification failed. Please contact support."
          );

          // Still close the WebView even if verification fails
          setTimeout(() => {
            navigation.goBack();
          }, 2000);
        } finally {
          setIsLoading(false);
        }
      } else if (!paymentReference) {
        console.warn(
          "⚠️ [PAYMENT WEBVIEW] No reference available for verification"
        );
        showError("Payment reference missing. Please contact support.");
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      }
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

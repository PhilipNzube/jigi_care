import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import AddressSection from "../components/AddressSection";
import { initializeMedicationPayment } from "../../payment/services/paymentService";
import { showError, showSuccess } from "../../../shared/utils/toast";

export default function ShippingAddressScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { cartId } = route.params || {};
  const addressSectionRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      spinValue.setValue(0);
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.stopAnimation();
    }
  }, [isLoading]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleProcessToPayment = async () => {
    if (!cartId) {
      showError("Cart ID not found. Please try again.");
      return;
    }

    const deliveryAddress = addressSectionRef.current?.getAddress();
    if (!deliveryAddress || !deliveryAddress.trim()) {
      showError("Please enter a delivery address");
      return;
    }

    try {
      setIsLoading(true);
      console.log("💳 [SHIPPING ADDRESS] Initializing medication payment...");
      
      const response = await initializeMedicationPayment(cartId, deliveryAddress.trim());

      if (!response.success || !response.data) {
        throw new Error("Payment initialization failed");
      }

      const { authorization_url, reference } = response.data;
      console.log("✅ [SHIPPING ADDRESS] Payment initialized, opening WebView...");

      // Navigate to payment WebView
      navigation.navigate("PaymentWebView", {
        authorizationUrl: authorization_url,
        reference: reference,
        callbackUrl: "https://yourcallback.com",
        source: "Medication",
      });
    } catch (error) {
      console.error("❌ [SHIPPING ADDRESS] Error initializing payment:", error);
      showError("Unable to process payment. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shipping Address</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <AddressSection ref={addressSectionRef} />
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.processButton,
          { marginBottom: insets.bottom + Sizes.lg },
          isLoading && styles.processButtonDisabled,
        ]}
        onPress={handleProcessToPayment}
        disabled={isLoading}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Animated.Image
              source={Images.loader}
              style={[styles.loader, { transform: [{ rotate: spin }] }]}
            />
          </View>
        ) : (
          <Text style={styles.processButtonText}>Process to Payment</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    backgroundColor: "#F8F8F8",
    position: "relative",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: Sizes.lg,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.lg,
  },
  processButton: {
    backgroundColor: "#0098B3",
    marginHorizontal: Sizes.lg,
    marginBottom: Sizes.lg,
    paddingVertical: Sizes.md,
    borderRadius: 30,
    alignItems: "center",
  },
  processButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
  },
  processButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    width: 24,
    height: 24,
    tintColor: Colors.white,
  },
});

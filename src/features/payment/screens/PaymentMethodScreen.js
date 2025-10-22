import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

// Import components
import PaymentHeader from "../components/PaymentHeader";
import PaymentMethodCard from "../components/PaymentMethodCard";
import PaymentFooter from "../components/PaymentFooter";

export default function PaymentMethodScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState("");

  const { amount = "₦4,500" } = route.params || {};

  const paymentMethods = [
    {
      id: "card",
      title: "Pay with Card",
      icon: "card",
      description: "Credit or Debit Card",
    },
    {
      id: "transfer",
      title: "Pay with Transfer",
      icon: "bank",
      description: "Bank Transfer",
    },
    {
      id: "ussd",
      title: "Pay with USSD",
      icon: "phone",
      description: "USSD Code",
    },
  ];

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
  };

  const handleContinue = () => {
    if (selectedMethod === "card") {
      navigation.navigate("CardPayment", { amount });
    } else if (selectedMethod === "transfer") {
      navigation.navigate("BankTransfer", { amount });
    } else if (selectedMethod === "ussd") {
      navigation.navigate("USSDPayment", { amount });
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <>
      <PaymentHeader
        title="Payment"
        onBackPress={() => navigation.goBack()}
        amount="NGN 4,500"
        showContentArea={false}
        style={{ paddingTop: insets.top }}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.body}>
          <Text style={styles.paystackLabel}>PAYSTACK CHECKOUT</Text>
          <Text style={styles.description}>
            Please complete your payment of{" "}
            <Text style={styles.priceText}>{amount}</Text> using one of the
            options listed below.
          </Text>

          <View style={styles.methodsContainer}>
            <View style={styles.paymentMethodsCard}>
              {paymentMethods.map((method, index) => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  isSelected={selectedMethod === method.id}
                  onSelect={() => handleMethodSelect(method.id)}
                  showDivider={index < paymentMethods.length - 1}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedMethod && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedMethod}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>

          <PaymentFooter onCancel={handleCancel} />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  body: {
    padding: Sizes.lg,
  },
  paystackLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#0098B3",
    marginBottom: Sizes.sm,
  },
  description: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
    marginBottom: Sizes.xl,
    lineHeight: 20,
  },
  priceText: {
    color: Colors.black,
    fontFamily: "Poppins-Bold",
  },
  methodsContainer: {
    marginBottom: Sizes.xl,
  },
  paymentMethodsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: "hidden",
  },
  footer: {
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.md,
  },
  continueButton: {
    backgroundColor: "#0098B3",
    borderRadius: 30,
    paddingVertical: Sizes.md,
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  continueButtonDisabled: {
    backgroundColor: "#0098B3",
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
});

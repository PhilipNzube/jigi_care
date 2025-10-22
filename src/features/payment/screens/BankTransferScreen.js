import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import { Ionicons } from "@expo/vector-icons";

// Import components
import PaymentHeader from "../components/PaymentHeader";
import PaymentFooter from "../components/PaymentFooter";
import BookingConfirmationModal from "../components/BookingConfirmationModal";
import { Images } from "../../../shared/utils/imageUtils";

export default function BankTransferScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Animation
  const spinValue = useRef(new Animated.Value(0)).current;

  const { amount = "₦4,500" } = route.params || {};

  // Spinning animation
  useEffect(() => {
    if (isLoading) {
      const spin = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spin.start();
    } else {
      spinValue.setValue(0);
    }
  }, [isLoading, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const transferDetails = {
    bankName: "Paystack-Titan",
    accountNumber: "012346789",
    amount: amount,
    expiryTime: "23:12",
  };

  const handleCopy = (text, type) => {
    // Implement copy functionality
    console.log(`Copied ${type}:`, text);
  };

  const handlePay = async () => {
    setIsLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      setShowModal(true);
    }, 3000);
  };

  const handleModalClose = () => {
    setShowModal(false);
    // Don't navigate here - just close the modal
  };

  const handleBackToHome = () => {
    setShowModal(false);
    navigation.navigate("BottomTabs");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <PaymentHeader
        title="Payment"
        onBackPress={() => navigation.goBack()}
        amount={amount}
        showContentArea={true}
        style={{ paddingTop: insets.top }}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.body}>
          <Text style={styles.title}>
            Transfer {amount} to Paystack Checkout
          </Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bank Name</Text>
              <Text style={styles.detailValue}>{transferDetails.bankName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Account Number</Text>
              <View style={styles.detailValueContainer}>
                <Text style={styles.detailValue}>
                  {transferDetails.accountNumber}
                </Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() =>
                    handleCopy(transferDetails.accountNumber, "Account Number")
                  }
                >
                  <Ionicons name="copy-outline" size={16} color="#0098B3" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount</Text>
              <View style={styles.detailValueContainer}>
                <Text style={styles.detailValue}>{transferDetails.amount}</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => handleCopy(transferDetails.amount, "Amount")}
                >
                  <Ionicons name="copy-outline" size={16} color="#0098B3" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.expiryText}>
            This account is for this transaction only and expires in{" "}
            <Text style={styles.expiryTime}>{transferDetails.expiryTime}</Text>
          </Text>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
          <TouchableOpacity
            style={styles.payButton}
            onPress={handlePay}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Animated.Image
                  source={Images.loader}
                  style={[styles.loader, { transform: [{ rotate: spin }] }]}
                />
                <Text style={styles.payButtonText}>Processing...</Text>
              </View>
            ) : (
              <Text style={styles.payButtonText}>Pay {amount}</Text>
            )}
          </TouchableOpacity>

          <PaymentFooter onCancel={() => navigation.goBack()} />
        </View>
      </ScrollView>

      <BookingConfirmationModal
        visible={showModal}
        onClose={handleModalClose}
        onBackToHome={handleBackToHome}
        bookingDetails={{
          doctor: "Dr. Sarah Olukoya",
          date: "Sep 18th, 2025",
          time: "10:00 AM",
          fee: amount,
        }}
      />
    </KeyboardAvoidingView>
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
  title: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: Sizes.xl,
    textAlign: "center",
  },
  detailsContainer: {
    marginBottom: Sizes.lg,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#666",
  },
  detailValue: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  detailValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  copyButton: {
    marginLeft: Sizes.sm,
    padding: Sizes.xs,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: Sizes.lg,
  },
  expiryText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
    lineHeight: 20,
    textAlign: "center",
  },
  expiryTime: {
    color: "#0098B3",
    fontFamily: "Poppins-Bold",
  },
  footer: {
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.md,
  },
  payButton: {
    backgroundColor: "#0098B3",
    borderRadius: 30,
    paddingVertical: Sizes.md,
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  payButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    width: 32,
    height: 32,
    marginRight: Sizes.sm,
  },
});

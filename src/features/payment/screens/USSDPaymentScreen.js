import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
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

export default function USSDPaymentScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
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

  const banks = [
    "Access Bank",
    "First Bank",
    "GTBank",
    "Zenith Bank",
    "UBA",
    "FCMB",
    "Stanbic IBTC",
    "Union Bank",
  ];

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

  const isFormValid = () => {
    return selectedBank && accountNumber.trim().length >= 10;
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
          <View style={styles.iconContainer}>
            <Ionicons name="phone-portrait-outline" size={48} color="#0098B3" />
          </View>

          <Text style={styles.title}>
            Choose your bank to start the payment
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Choose Bank</Text>
              <TouchableOpacity style={styles.bankSelector}>
                <Text
                  style={[
                    styles.bankSelectorText,
                    !selectedBank && styles.placeholderText,
                  ]}
                >
                  {selectedBank || "Select Bank"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your account number"
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
          <TouchableOpacity
            style={[
              styles.payButton,
              !isFormValid() && styles.payButtonDisabled,
            ]}
            onPress={handlePay}
            disabled={!isFormValid() || isLoading}
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
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: Sizes.xl,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: Sizes.xl,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: Sizes.lg,
  },
  label: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#666",
    marginBottom: Sizes.sm,
  },
  bankSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: Sizes.md,
    backgroundColor: "#F8F8F8",
    height: 56,
  },
  bankSelectorText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
  },
  placeholderText: {
    color: "#999",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: Sizes.md,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    backgroundColor: "#F8F8F8",
    height: 56,
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
  payButtonDisabled: {
    backgroundColor: "#0098B3",
    opacity: 0.5,
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

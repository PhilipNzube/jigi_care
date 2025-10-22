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

// Import components
import PaymentHeader from "../components/PaymentHeader";
import PaymentFooter from "../components/PaymentFooter";
import BookingConfirmationModal from "../components/BookingConfirmationModal";
import { Images } from "../../../shared/utils/imageUtils";

export default function CardPaymentScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Animation
  const spinValue = useRef(new Animated.Value(0)).current;

  // Validation states
  const [errors, setErrors] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [touched, setTouched] = useState({
    cardNumber: false,
    expiryDate: false,
    cvv: false,
  });

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

  const formatCardNumber = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, "");

    // Limit to 16 digits
    const limited = cleaned.slice(0, 16);

    // Add spaces every 4 digits
    const formatted = limited.replace(/(\d{4})(?=\d)/g, "$1 ");

    return formatted;
  };

  const handleCardNumberChange = (text) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
    if (touched.cardNumber) {
      validateField("cardNumber", formatted);
    }
  };

  const handleCardNumberBlur = () => {
    setTouched((prev) => ({ ...prev, cardNumber: true }));
    validateField("cardNumber", cardNumber);
  };

  const formatExpiryDate = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, "");

    // Limit to 4 digits
    const limited = cleaned.slice(0, 4);

    // Add slash after 2 digits
    if (limited.length >= 2) {
      return limited.slice(0, 2) + "/" + limited.slice(2);
    }

    return limited;
  };

  const handleExpiryDateChange = (text) => {
    const formatted = formatExpiryDate(text);
    setExpiryDate(formatted);
    if (touched.expiryDate) {
      validateField("expiryDate", formatted);
    }
  };

  const handleExpiryDateBlur = () => {
    setTouched((prev) => ({ ...prev, expiryDate: true }));
    validateField("expiryDate", expiryDate);
  };

  const handleCVVChange = (text) => {
    setCvv(text);
    if (touched.cvv) {
      validateField("cvv", text);
    }
  };

  const handleCVVBlur = () => {
    setTouched((prev) => ({ ...prev, cvv: true }));
    validateField("cvv", cvv);
  };

  // Validation functions
  const validateCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length === 0) {
      return "Card number is required";
    }
    if (cleaned.length < 16) {
      return "Card number must be 16 digits";
    }
    if (!/^\d{16}$/.test(cleaned)) {
      return "Card number must contain only digits";
    }
    return "";
  };

  const validateExpiryDate = (value) => {
    if (value.length === 0) {
      return "Expiry date is required";
    }
    if (value.length < 5) {
      return "Expiry date must be MM/YY format";
    }
    const [month, year] = value.split("/");
    if (!month || !year) {
      return "Invalid date format";
    }
    const monthNum = parseInt(month);
    const yearNum = parseInt("20" + year);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    if (monthNum < 1 || monthNum > 12) {
      return "Invalid month";
    }
    if (
      yearNum < currentYear ||
      (yearNum === currentYear && monthNum < currentMonth)
    ) {
      return "Card has expired";
    }
    return "";
  };

  const validateCVV = (value) => {
    if (value.length === 0) {
      return "CVV is required";
    }
    if (value.length < 3) {
      return "CVV must be at least 3 digits";
    }
    if (!/^\d{3,4}$/.test(value)) {
      return "CVV must contain only digits";
    }
    return "";
  };

  const validateField = (field, value) => {
    let error = "";
    switch (field) {
      case "cardNumber":
        error = validateCardNumber(value);
        break;
      case "expiryDate":
        error = validateExpiryDate(value);
        break;
      case "cvv":
        error = validateCVV(value);
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));

    return error === "";
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

  const isFormValid = () => {
    const cardNumberValid = validateCardNumber(cardNumber) === "";
    const expiryDateValid = validateExpiryDate(expiryDate) === "";
    const cvvValid = validateCVV(cvv) === "";

    return cardNumberValid && expiryDateValid && cvvValid;
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
          <Text style={styles.title}>Enter your card details to pay</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CARD NUMBER</Text>
              <TextInput
                style={[
                  styles.cardNumberInput,
                  touched.cardNumber && errors.cardNumber && styles.inputError,
                ]}
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                onBlur={handleCardNumberBlur}
                keyboardType="numeric"
                maxLength={19}
              />
              {touched.cardNumber && errors.cardNumber && (
                <Text style={styles.errorText}>{errors.cardNumber}</Text>
              )}
            </View>

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>MM/YY</Text>
                <TextInput
                  style={[
                    styles.input,
                    touched.expiryDate &&
                      errors.expiryDate &&
                      styles.inputError,
                  ]}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={handleExpiryDateChange}
                  onBlur={handleExpiryDateBlur}
                  keyboardType="numeric"
                  maxLength={5}
                />
                {touched.expiryDate && errors.expiryDate && (
                  <Text style={styles.errorText}>{errors.expiryDate}</Text>
                )}
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>CVV</Text>
                <View style={styles.cvvContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      touched.cvv && errors.cvv && styles.inputError,
                    ]}
                    placeholder="123"
                    value={cvv}
                    onChangeText={handleCVVChange}
                    onBlur={handleCVVBlur}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                  <TouchableOpacity style={styles.helpButton}>
                    <Text style={styles.helpText}>HELP?</Text>
                  </TouchableOpacity>
                </View>
                {touched.cvv && errors.cvv && (
                  <Text style={styles.errorText}>{errors.cvv}</Text>
                )}
              </View>
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
  },
  form: {
    marginBottom: Sizes.xl,
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
  cardNumberInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: Sizes.md,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    backgroundColor: "#F8F8F8",
    height: 56,
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    flex: 1,
    marginRight: Sizes.sm,
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
  cvvContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  helpButton: {
    marginLeft: Sizes.sm,
  },
  helpText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#0098B3",
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
  inputError: {
    borderColor: "#FF6B6B",
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#FF6B6B",
    marginTop: Sizes.xs,
    marginLeft: Sizes.xs,
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

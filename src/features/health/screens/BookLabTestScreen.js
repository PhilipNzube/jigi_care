import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import { format, parse, addDays, startOfWeek } from "date-fns";
import {
  bookTest,
  initializeTestPayment,
  getLabCenters,
} from "../services/labTestService";
import { showError, showSuccess } from "../../../shared/utils/toast";
import TestDetailsCard from "../components/TestDetailsCard";
import DateSelector from "../components/DateSelector";
import TimeSelector from "../components/TimeSelector";
import CollectionTypeSelector from "../components/CollectionTypeSelector";
import PaymentSummary from "../components/PaymentSummary";

const { height } = Dimensions.get("window");

export default function BookLabTestScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { test } = route.params || {};
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [collectionType, setCollectionType] = useState("home_collection");
  const [isLoading, setIsLoading] = useState(false);
  const [labCenters, setLabCenters] = useState([]);
  const [selectedLabId, setSelectedLabId] = useState(null);
  const spinValue = useRef(new Animated.Value(0)).current;

  // Extract test data
  const testData = test?.testData || test;
  const currentTest = test || {
    name: testData?.title || "Test",
    description: testData?.description || "",
    price: `₦${testData?.amount?.toLocaleString() || "0"}`,
    duration: `${testData?.durationInHrs || 24} hours`,
    preparation: testData?.preparation || "No preparation required",
    image: Images.placeholder,
    testData: testData,
  };

  const homeCollectionFee = 2000;
  const testAmount = testData?.amount || 0;
  const totalAmount =
    testAmount + (collectionType === "home_collection" ? homeCollectionFee : 0);

  useEffect(() => {
    fetchLabCenters();
  }, []);

  // Handle spinner animation
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

  const fetchLabCenters = async () => {
    try {
      const response = await getLabCenters();
      const centers = response.data || [];
      setLabCenters(centers);
      if (centers.length > 0) {
        setSelectedLabId(centers[0].id);
      }
    } catch (error) {
      console.error("❌ [BOOK LAB TEST] Error fetching lab centers:", error);
    }
  };

  const handleBookTest = async () => {
    setIsLoading(true);

    try {
      if (!testData?.id) {
        showError("Test information is missing");
        setIsLoading(false);
        return;
      }

      if (!selectedLabId) {
        showError("Please select a lab center");
        setIsLoading(false);
        return;
      }

      if (!selectedDate || !selectedTime) {
        showError("Please select date and time");
        setIsLoading(false);
        return;
      }
      // Parse date and time
      // DateSelector uses format "EEE d" (e.g., "Sun 18")
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
      let bookingDate = new Date();

      // Find the date object from DateSelector by matching the format
      for (let i = 0; i < 7; i++) {
        const checkDate = addDays(weekStart, i);
        if (format(checkDate, "EEE d") === selectedDate) {
          bookingDate = checkDate;
          break;
        }
      }

      // If no match found, use today's date
      if (format(bookingDate, "EEE d") !== selectedDate) {
        bookingDate = new Date();
      }

      // Parse time
      const timeMatch = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeMatch) {
        throw new Error("Invalid time format");
      }

      let hour = parseInt(timeMatch[1]);
      const minute = parseInt(timeMatch[2] || "0");
      const period = timeMatch[3].toUpperCase();

      if (period === "PM" && hour !== 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;

      bookingDate.setHours(hour, minute, 0, 0);

      // Ensure it's not in the past
      if (bookingDate < new Date()) {
        setIsLoading(false);
        showError("Please select a future date and time");
        return;
      }

      const dateISO = bookingDate.toISOString();

      // Create booking
      const bookingData = {
        testId: testData.id,
        labId: selectedLabId,
        collection: collectionType,
        date: dateISO,
      };

      console.log("📝 [BOOK LAB TEST] Creating booking:", bookingData);
      const bookingResponse = await bookTest(bookingData);

      if (!bookingResponse.data || !bookingResponse.data.id) {
        throw new Error("Booking created but no booking ID received");
      }

      const testBookingId = bookingResponse.data.id;
      console.log("✅ [BOOK LAB TEST] Booking created with ID:", testBookingId);

      // Initialize payment
      console.log("💳 [BOOK LAB TEST] Initializing payment...");
      const paymentResponse = await initializeTestPayment({
        testBookingId,
        collection: collectionType,
        date: dateISO,
      });

      if (!paymentResponse.data || !paymentResponse.data.authorization_url) {
        throw new Error("Payment initialization failed");
      }

      const { authorization_url, reference } = paymentResponse.data;
      console.log("✅ [BOOK LAB TEST] Payment initialized, opening WebView...");

      // Navigate to payment WebView
      navigation.navigate("PaymentWebView", {
        authorizationUrl: authorization_url,
        reference: reference,
        callbackUrl: "https://yourcallback.com",
        source: "BookLabTest", // Indicate we came from BookLabTest
      });
    } catch (error) {
      console.error("❌ [BOOK LAB TEST] Error:", error);
      showError(error.message || "Failed to book test. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ImageBackground
          source={Images.bgImg}
          style={[styles.backgroundImage, { paddingTop: insets.top }]}
          resizeMode="cover"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Book Lab Test</Text>
          </View>

          {/* Test Details Card */}
          <TestDetailsCard test={currentTest} />
        </ImageBackground>

        {/* Content with curved top */}
        <View style={styles.contentWrapper}>
          {/* Content Sections */}
          <View style={styles.contentContainer}>
            <DateSelector
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />

            <TimeSelector
              selectedTime={selectedTime}
              onTimeSelect={setSelectedTime}
              durationInHrs={testData?.durationInHrs}
              selectedDate={selectedDate}
            />

            <CollectionTypeSelector
              collectionType={collectionType}
              onCollectionTypeChange={setCollectionType}
              homeCollectionFee={homeCollectionFee}
            />

            <PaymentSummary
              testPrice={currentTest.price}
              collectionType={
                collectionType === "home_collection"
                  ? "home"
                  : collectionType === "lab_collection"
                    ? "lab"
                    : "home"
              }
              homeCollectionFee={homeCollectionFee}
              totalAmount={totalAmount}
            />
          </View>
        </View>
      </ScrollView>

      {/* Book Test Button - Sticky to bottom */}
      <View
        style={[styles.bookButtonContainer, { paddingBottom: insets.bottom }]}
      >
        <TouchableOpacity
          style={[styles.bookButton, isLoading && styles.bookButtonLoading]}
          onPress={handleBookTest}
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
            <Text style={styles.bookButtonText}>
              Book Test - ₦{totalAmount.toLocaleString()}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for book button
  },
  backgroundImage: {
    height: height * 0.5,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    position: "relative",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: Sizes.lg,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
    flex: 1,
    textAlign: "center",
  },
  contentWrapper: {
    backgroundColor: "#F8F8F8",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    zIndex: 1,
  },
  contentContainer: {
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.xl, // More space between header and content
  },
  bookButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.md,
  },
  bookButton: {
    backgroundColor: "#0098B3",
    borderRadius: 30,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  bookButtonLoading: {
    backgroundColor: "#007A8B",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    width: 32,
    height: 32,
  },
  bookButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
});

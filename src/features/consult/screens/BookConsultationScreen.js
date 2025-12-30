import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Dimensions,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import { createBooking, getAvailableSlots } from "../services/bookingService";
import { initializePayment } from "../../payment/services/paymentService";
import { showError, showSuccess } from "../../../shared/utils/toast";
import { format, parseISO, formatISO } from "date-fns";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";

const { height } = Dimensions.get("window");

// Import components
import DoctorProfileHeader from "../components/DoctorProfileHeader";
import DoctorProfileCard from "../components/DoctorProfileCard";
import DateSelectionSection from "../components/DateSelectionSection";
import TimeSelectionSection from "../components/TimeSelectionSection";
import SymptomsInputSection from "../components/SymptomsInputSection";
import PaymentSummarySection from "../components/PaymentSummarySection";
import BookConsultationButton from "../components/BookConsultationButton";

// Skeleton Component
function BookConsultationSkeleton({ insets }) {
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
          {/* Header Skeleton */}
          <ShimmerLoader>
            <View style={styles.skeletonHeader} />
          </ShimmerLoader>

          {/* Doctor Card Skeleton */}
          <ShimmerLoader>
            <View style={styles.skeletonDoctorCard} />
          </ShimmerLoader>
        </ImageBackground>

        {/* Content Skeleton */}
        <View style={styles.contentWrapper}>
          <View style={styles.contentContainer}>
            {/* Date Selection Skeleton */}
            <View style={styles.skeletonSection}>
              <ShimmerLoader>
                <View style={styles.skeletonTitle} />
              </ShimmerLoader>
              <View style={styles.skeletonDateRow}>
                {[1, 2, 3, 4, 5, 6, 7].map((index) => (
                  <ShimmerLoader key={index}>
                    <View style={styles.skeletonDateButton} />
                  </ShimmerLoader>
                ))}
              </View>
            </View>

            {/* Time Selection Skeleton */}
            <View style={styles.skeletonSection}>
              <ShimmerLoader>
                <View style={styles.skeletonTitle} />
              </ShimmerLoader>
              <View style={styles.skeletonTimeRow}>
                {[1, 2, 3, 4, 5].map((index) => (
                  <ShimmerLoader key={index}>
                    <View style={styles.skeletonTimeButton} />
                  </ShimmerLoader>
                ))}
              </View>
            </View>

            {/* Symptoms Input Skeleton */}
            <ShimmerLoader>
              <View style={styles.skeletonSection}>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonInput} />
              </View>
            </ShimmerLoader>

            {/* Payment Summary Skeleton */}
            <ShimmerLoader>
              <View style={styles.skeletonSection}>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonPaymentRow} />
                <View style={styles.skeletonPaymentRow} />
              </View>
            </ShimmerLoader>
          </View>
        </View>
      </ScrollView>

      {/* Button Skeleton */}
      <View
        style={[styles.bookButtonContainer, { paddingBottom: insets.bottom }]}
      >
        <ShimmerLoader>
          <View style={styles.skeletonButton} />
        </ShimmerLoader>
      </View>
    </View>
  );
}

export default function BookConsultationScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const doctor = route.params?.doctor || {
    name: "Dr. Sarah Olukoya",
    specialty: "Neurologist",
    rating: "4.8",
    experience: "7+ years experience",
    languages: "English",
    price: "₦4,000/session",
  };

  // Get consultantId from doctor data (userId from consultant data)
  const consultantId = doctor.consultantData?.userId;

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDateObj, setSelectedDateObj] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(!doctor);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    // Simulate loading if doctor data is not immediately available
    if (!doctor) {
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsInitialLoading(false);
    }
  }, [doctor]);

  // Validation function
  const isFormValid = () => {
    return selectedDate && selectedTime && symptoms.trim().length > 0;
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleDateSelectWithObj = async (dateObj) => {
    setSelectedDateObj(dateObj);
    setSelectedTime(""); // Clear selected time when date changes

    // Fetch available slots for the selected date
    if (consultantId && dateObj) {
      setIsLoadingSlots(true);
      try {
        // Format date for API: YYYY-MM-DDTHH:mm:ss format
        // Use a default time (10:00:00) for the date query
        // Ensure we're using the date part only and adding time
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        const dateForApi = `${year}-${month}-${day}T10:00:00`;
        console.log(
          "📅 [BOOK CONSULTATION] Fetching slots for date:",
          dateForApi
        );

        const response = await getAvailableSlots(consultantId, dateForApi);

        // Handle response - availableSlots can be directly on response or in response.data
        const availableSlots =
          response.availableSlots || response.data?.availableSlots || [];

        if (availableSlots.length > 0) {
          setAvailableSlots(availableSlots);
          console.log(
            "✅ [BOOK CONSULTATION] Available slots:",
            availableSlots.length
          );
        } else {
          setAvailableSlots([]);
          console.log("⚠️ [BOOK CONSULTATION] No available slots found");
        }
      } catch (error) {
        console.error("❌ [BOOK CONSULTATION] Error fetching slots:", error);
        setAvailableSlots([]);
        showError("Failed to load available time slots");
      } finally {
        setIsLoadingSlots(false);
      }
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleSymptomsChange = (text) => {
    setSymptoms(text);
  };

  const handleBookConsultation = async () => {
    if (!consultantId) {
      showError("Doctor information is missing. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      // Combine date and time into ISO format
      // Use selectedDateObj if available, otherwise parse from selectedDate string
      let bookingDate;

      if (selectedDateObj) {
        // Use the date object directly
        bookingDate = new Date(selectedDateObj);
      } else {
        // Fallback: parse from selectedDate string (format: "EEE d")
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dateMatch = selectedDate.match(/\d+/);
        const dayNumber = dateMatch ? parseInt(dateMatch[0]) : today.getDate();
        bookingDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          dayNumber
        );

        // If the day number is less than today's day, assume it's next month
        if (dayNumber < today.getDate()) {
          bookingDate = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            dayNumber
          );
        }
      }

      // Parse time - use value from API slot if available, otherwise parse display format
      const selectedSlot = availableSlots.find(
        (slot) => slot.display === selectedTime
      );
      if (selectedSlot && selectedSlot.value) {
        // Use the value from API (format: "HH:mm:ss")
        const [hours, minutes, seconds] = selectedSlot.value
          .split(":")
          .map(Number);
        bookingDate.setHours(hours, minutes || 0, seconds || 0);
      } else {
        // Fallback: parse display format (e.g., "10:00 AM")
        const [timePart, period] = selectedTime.split(" ");
        const [hours, minutes] = timePart.split(":").map(Number);
        let hour24 = hours;
        if (period === "PM" && hours !== 12) hour24 += 12;
        if (period === "AM" && hours === 12) hour24 = 0;
        bookingDate.setHours(hour24, minutes || 0, 0);
      }

      // Ensure it's not in the past
      if (bookingDate < new Date()) {
        showError("Please select a future date and time");
        setIsLoading(false);
        return;
      }

      // Convert to ISO string
      const dateISO = bookingDate.toISOString();

      // Create booking - symptoms should be a string, not an array
      const bookingData = {
        date: dateISO,
        duration: 1, // Changed to 1 hour
        symptoms: symptoms.trim(), // Send as string
        consultantId: consultantId,
      };

      console.log("📝 [BOOK CONSULTATION] Creating booking:", bookingData);
      const response = await createBooking(bookingData);

      if (!response.data || !response.data.id) {
        throw new Error("Booking created but no booking ID received");
      }

      const bookingId = response.data.id;
      console.log("✅ [BOOK CONSULTATION] Booking created with ID:", bookingId);

      // Initialize payment
      console.log("💳 [BOOK CONSULTATION] Initializing payment...");
      const paymentResponse = await initializePayment(bookingId, consultantId);

      if (!paymentResponse.data || !paymentResponse.data.authorization_url) {
        throw new Error("Payment initialization failed");
      }

      const { authorization_url, reference } = paymentResponse.data;
      console.log(
        "✅ [BOOK CONSULTATION] Payment initialized, opening WebView..."
      );

      // Navigate to payment WebView
      navigation.navigate("PaymentWebView", {
        authorizationUrl: authorization_url,
        reference: reference,
        callbackUrl: "https://yourcallback.com", // You may want to configure this
      });
    } catch (error) {
      console.error("❌ [BOOK CONSULTATION] Error:", error);

      // Check for specific error messages
      if (
        error.data?.message &&
        error.data.message.includes("already booked")
      ) {
        showError(error.data.message);
      } else {
        const errorMessage =
          error.data?.message ||
          error.message ||
          "Failed to create booking. Please try again.";
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return <BookConsultationSkeleton insets={insets} />;
  }

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
          <DoctorProfileHeader
            onBackPress={handleBackPress}
            title="Book Consultation"
          />

          {/* Doctor Profile Card - Compact like home screen */}
          <DoctorProfileCard doctor={doctor} />
        </ImageBackground>

        {/* Content with curved top */}
        <View style={styles.contentWrapper}>
          {/* Content Sections */}
          <View style={styles.contentContainer}>
            <DateSelectionSection
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onDateSelectWithObj={handleDateSelectWithObj}
            />
            <TimeSelectionSection
              selectedTime={selectedTime}
              onTimeSelect={handleTimeSelect}
              selectedDate={selectedDateObj}
              availableSlots={availableSlots}
              isLoadingSlots={isLoadingSlots}
            />
            <SymptomsInputSection
              symptoms={symptoms}
              onSymptomsChange={handleSymptomsChange}
            />
            <PaymentSummarySection doctor={doctor} />
          </View>
        </View>
      </ScrollView>

      {/* Book Consultation Button - Sticky to bottom */}
      <View
        style={[styles.bookButtonContainer, { paddingBottom: insets.bottom }]}
      >
        <BookConsultationButton
          doctor={doctor}
          onPress={handleBookConsultation}
          isLoading={isLoading}
          isDisabled={!isFormValid()}
        />
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
    height: height * 0.4,
    width: "100%",
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
  // Skeleton styles
  skeletonHeader: {
    height: 60,
    marginHorizontal: Sizes.lg,
    marginTop: Sizes.md,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
  },
  skeletonDoctorCard: {
    height: 120,
    marginHorizontal: Sizes.lg,
    marginTop: Sizes.md,
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
  },
  skeletonSection: {
    marginBottom: Sizes.xl,
  },
  skeletonTitle: {
    width: "50%",
    height: 20,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginBottom: Sizes.md,
  },
  skeletonDateRow: {
    flexDirection: "row",
    gap: Sizes.sm,
    marginTop: Sizes.sm,
  },
  skeletonDateButton: {
    width: 50,
    height: 70,
    borderRadius: 25,
    backgroundColor: Colors.lightGray,
  },
  skeletonTimeRow: {
    flexDirection: "row",
    gap: Sizes.sm,
    marginTop: Sizes.sm,
  },
  skeletonTimeButton: {
    width: 80,
    height: 36,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
  },
  skeletonInput: {
    height: 100,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
  },
  skeletonPaymentRow: {
    height: 20,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginBottom: Sizes.xs,
    width: "70%",
  },
  skeletonButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.lightGray,
  },
});

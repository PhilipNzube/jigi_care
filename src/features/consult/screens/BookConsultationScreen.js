import React, { useState } from "react";
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
import { createBooking } from "../services/bookingService";
import { showError, showSuccess } from "../../../shared/utils/toast";
import { format, parseISO } from "date-fns";

const { height } = Dimensions.get("window");

// Import components
import DoctorProfileHeader from "../components/DoctorProfileHeader";
import DoctorProfileCard from "../components/DoctorProfileCard";
import DateSelectionSection from "../components/DateSelectionSection";
import TimeSelectionSection from "../components/TimeSelectionSection";
import SymptomsInputSection from "../components/SymptomsInputSection";
import PaymentSummarySection from "../components/PaymentSummarySection";
import BookConsultationButton from "../components/BookConsultationButton";

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

  const handleDateSelectWithObj = (dateObj) => {
    setSelectedDateObj(dateObj);
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
        bookingDate = new Date(today.getFullYear(), today.getMonth(), dayNumber);
        
        // If the day number is less than today's day, assume it's next month
        if (dayNumber < today.getDate()) {
          bookingDate = new Date(today.getFullYear(), today.getMonth() + 1, dayNumber);
        }
      }
      
      // Parse time
      const [timePart, period] = selectedTime.split(" ");
      const [hours, minutes] = timePart.split(":").map(Number);
      let hour24 = hours;
      if (period === "PM" && hours !== 12) hour24 += 12;
      if (period === "AM" && hours === 12) hour24 = 0;

      // Set time on booking date
      bookingDate.setHours(hour24, minutes || 0, 0, 0);
      
      // Ensure it's not in the past
      if (bookingDate < new Date()) {
        showError("Please select a future date and time");
        setIsLoading(false);
        return;
      }

      // Convert to ISO string
      const dateISO = bookingDate.toISOString();

      // Split symptoms by comma or newline
      const symptomsArray = symptoms
        .split(/[,\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Create booking
      const bookingData = {
        date: dateISO,
        duration: 2, // Default 2 hours
        symptoms: symptomsArray,
        consultantId: consultantId,
      };

      console.log("📝 [BOOK CONSULTATION] Creating booking:", bookingData);
      const response = await createBooking(bookingData);

      showSuccess("Booking created successfully!");
      
      // Navigate to payment method selection
      navigation.navigate("PaymentMethod", {
        amount: doctor.price || "₦4,500",
        doctor: doctor,
        bookingDetails: {
          date: selectedDate,
          time: selectedTime,
          symptoms: symptoms,
          bookingId: response.data?.id,
        },
      });
    } catch (error) {
      console.error("❌ [BOOK CONSULTATION] Error:", error);
      const errorMessage = error.data?.message || error.message || "Failed to create booking. Please try again.";
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
              selectedDate={selectedDate}
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
});

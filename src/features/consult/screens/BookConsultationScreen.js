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

  const [selectedDate, setSelectedDate] = useState("");
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

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleSymptomsChange = (text) => {
    setSymptoms(text);
  };

  const handleBookConsultation = async () => {
    setIsLoading(true);

    // Simulate booking process
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to payment method selection
      navigation.navigate("PaymentMethod", {
        amount: "₦4,500",
        doctor: doctor,
        bookingDetails: {
          date: selectedDate,
          time: selectedTime,
          symptoms: symptoms,
        },
      });
    }, 2000);
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
            />
            <TimeSelectionSection
              selectedTime={selectedTime}
              onTimeSelect={handleTimeSelect}
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

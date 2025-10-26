import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import TestDetailsCard from "../components/TestDetailsCard";
import DateSelector from "../components/DateSelector";
import TimeSelector from "../components/TimeSelector";
import CollectionTypeSelector from "../components/CollectionTypeSelector";
import PaymentSummary from "../components/PaymentSummary";

const { height } = Dimensions.get("window");

export default function BookLabTestScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { test } = route.params || {};
  const [selectedDate, setSelectedDate] = useState("Sun 18");
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [collectionType, setCollectionType] = useState("home");

  const defaultTest = {
    name: "Complete Blood Count (CBC)",
    description: "Comprehensive blood analysis including RBC, WBC, platelets",
    price: "₦14,000",
    duration: "24 hours",
    preparation: "No fasting required",
    image: Images.placeholder,
  };

  const currentTest = test || defaultTest;
  const homeCollectionFee = 2000;
  const totalAmount =
    parseInt(currentTest.price.replace(/[^\d]/g, "")) +
    (collectionType === "home" ? homeCollectionFee : 0);

  const handleBookTest = () => {
    // Navigate to payment screen or show confirmation
    console.log("Booking test:", {
      test: currentTest,
      date: selectedDate,
      time: selectedTime,
      collectionType,
      totalAmount,
    });

    // For now, just show an alert
    alert(`Test booked successfully!\nTotal: ₦${totalAmount.toLocaleString()}`);
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
            />

            <CollectionTypeSelector
              collectionType={collectionType}
              onCollectionTypeChange={setCollectionType}
              homeCollectionFee={homeCollectionFee}
            />

            <PaymentSummary
              testPrice={currentTest.price}
              collectionType={collectionType}
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
        <TouchableOpacity style={styles.bookButton} onPress={handleBookTest}>
          <Text style={styles.bookButtonText}>
            Book Test - ₦{totalAmount.toLocaleString()}
          </Text>
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
    alignItems: "center",
  },
  bookButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
});

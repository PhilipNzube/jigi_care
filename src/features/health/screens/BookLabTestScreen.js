import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

export default function BookLabTestScreen({ navigation, route }) {
  const { test } = route.params || {};
  const [selectedDate, setSelectedDate] = useState("Sun 18");
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [collectionType, setCollectionType] = useState("home");

  const dates = [
    { id: "Sun 18", label: "Sun 18" },
    { id: "Mon 19", label: "Mon 19" },
    { id: "Tue 20", label: "Tue 20" },
    { id: "Wed 21", label: "Wed 21" },
    { id: "Thu 22", label: "Thu 22" },
    { id: "Fri 23", label: "Fri 23" },
  ];

  const timeSlots = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
  ];

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

  const renderDateButton = (date) => (
    <TouchableOpacity
      key={date.id}
      style={[
        styles.dateButton,
        selectedDate === date.id && styles.selectedDateButton,
      ]}
      onPress={() => setSelectedDate(date.id)}
    >
      <Text
        style={[
          styles.dateButtonText,
          selectedDate === date.id && styles.selectedDateButtonText,
        ]}
      >
        {date.label}
      </Text>
    </TouchableOpacity>
  );

  const renderTimeButton = (time) => (
    <TouchableOpacity
      key={time}
      style={[
        styles.timeButton,
        selectedTime === time && styles.selectedTimeButton,
      ]}
      onPress={() => setSelectedTime(time)}
    >
      <Text
        style={[
          styles.timeButtonText,
          selectedTime === time && styles.selectedTimeButtonText,
        ]}
      >
        {time}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={Images.bgImg}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Book Lab Test</Text>
          </View>

          {/* Test Information Card */}
          <View style={styles.testInfoCard}>
            <Image source={currentTest.image} style={styles.testImage} />
            <View style={styles.testInfo}>
              <Text style={styles.testName}>{currentTest.name}</Text>
              <Text style={styles.testDescription}>
                {currentTest.description}
              </Text>
              <Text style={styles.testPrice}>{currentTest.price}</Text>
            </View>
          </View>

          {/* Test Details */}
          <View style={styles.testDetailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Test Duration:</Text>
              <Text style={styles.detailValue}>{currentTest.duration}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Preparation:</Text>
              <Text style={styles.detailValue}>{currentTest.preparation}</Text>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* Bottom Content */}
      <View style={styles.bottomContent}>
        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.datesContainer}
            >
              {dates.map(renderDateButton)}
            </ScrollView>
          </View>

          {/* Time Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Time</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.timesContainer}
            >
              {timeSlots.map(renderTimeButton)}
            </ScrollView>
          </View>

          {/* Collection Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Collection Type</Text>
            <View style={styles.collectionOptions}>
              <TouchableOpacity
                style={[
                  styles.collectionOption,
                  collectionType === "home" && styles.selectedCollectionOption,
                ]}
                onPress={() => setCollectionType("home")}
              >
                <View style={styles.radioButton}>
                  {collectionType === "home" && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
                <Text style={styles.collectionOptionText}>
                  Home Collection (+₦{homeCollectionFee.toLocaleString()})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.collectionOption,
                  collectionType === "lab" && styles.selectedCollectionOption,
                ]}
                onPress={() => setCollectionType("lab")}
              >
                <View style={styles.radioButton}>
                  {collectionType === "lab" && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
                <Text style={styles.collectionOptionText}>
                  Visit Lab Centre
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.paymentSummary}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Consultation Fee</Text>
                <Text style={styles.paymentValue}>{currentTest.price}</Text>
              </View>
              {collectionType === "home" && (
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Home Collection</Text>
                  <Text style={styles.paymentValue}>
                    ₦{homeCollectionFee.toLocaleString()}
                  </Text>
                </View>
              )}
              <View style={styles.paymentDivider} />
              <View style={styles.paymentRow}>
                <Text style={styles.paymentTotalLabel}>Total</Text>
                <Text style={styles.paymentTotalValue}>
                  ₦{totalAmount.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Book Button */}
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
    backgroundColor: "#F5F5F5",
  },
  backgroundImage: {
    flex: 0.4,
    justifyContent: "flex-start",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
  },
  backButton: {
    marginRight: Sizes.md,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
  testInfoCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginHorizontal: Sizes.lg,
    marginTop: Sizes.lg,
    borderRadius: 12,
    padding: Sizes.lg,
    alignItems: "center",
  },
  testImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: Sizes.md,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  testDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
    lineHeight: 20,
  },
  testPrice: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
  },
  testDetailsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginHorizontal: Sizes.lg,
    marginTop: Sizes.md,
    borderRadius: 12,
    padding: Sizes.lg,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  bottomContent: {
    flex: 0.6,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
  },
  section: {
    marginTop: Sizes.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  datesContainer: {
    marginBottom: Sizes.sm,
  },
  dateButton: {
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.sm,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
    marginRight: Sizes.sm,
  },
  selectedDateButton: {
    backgroundColor: Colors.primary,
  },
  dateButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
  },
  selectedDateButtonText: {
    color: Colors.white,
  },
  timesContainer: {
    marginBottom: Sizes.sm,
  },
  timeButton: {
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.sm,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
    marginRight: Sizes.sm,
  },
  selectedTimeButton: {
    backgroundColor: Colors.primary,
  },
  timeButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
  },
  selectedTimeButtonText: {
    color: Colors.white,
  },
  collectionOptions: {
    marginTop: Sizes.sm,
  },
  collectionOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  selectedCollectionOption: {
    backgroundColor: "#F0F8FF",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginRight: Sizes.md,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  collectionOptionText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
  },
  paymentSummary: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.lg,
    marginTop: Sizes.sm,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  paymentLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  paymentValue: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
  },
  paymentDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: Sizes.sm,
  },
  paymentTotalLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
  },
  paymentTotalValue: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: Sizes.lg,
    marginVertical: Sizes.lg,
    paddingVertical: Sizes.md,
    borderRadius: 8,
    alignItems: "center",
  },
  bookButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
});

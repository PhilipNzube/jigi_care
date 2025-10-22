import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import Ionicons from "react-native-vector-icons/Ionicons";
import FeedbackSubmittedModal from "../components/FeedbackSubmittedModal";

export default function ConsultationSummaryPage({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { doctor } = route.params || {};
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  const handleSubmitFeedback = () => {
    setShowFeedbackModal(true);
  };

  const handleModalClose = () => {
    setShowFeedbackModal(false);
  };

  const handleBackToHome = () => {
    navigation.navigate("BottomTabs");
  };

  const handleBookAnother = () => {
    navigation.navigate("BottomTabs");
  };

  const recommendations = [
    "Rest & stay hydrated",
    "Take prescribed medication as directed",
    "Use throat lozenges for comfort",
    "Return if symptoms worsen or persist beyond 7 days",
  ];

  const prescriptions = [
    {
      id: 1,
      name: "Acetaminophen",
      rating: 4.6,
      dosage: "500mg",
      description: "Pain reliever and fever reducer",
      price: "₦5,200",
      inStock: true,
    },
    {
      id: 2,
      name: "Ibuprofen",
      rating: 4.6,
      dosage: "200mg",
      description: "Pain relief and anti-inflammatory",
      price: "₦2,500",
      inStock: true,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <SafeAreaView style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.grey} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Consultation Summary</Text>
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Doctor Information Card */}
        <View style={styles.doctorCard}>
          <View style={styles.doctorImage}>
            <Ionicons name="person" size={30} color={Colors.white} />
          </View>
          <View style={styles.doctorInfo}>
            {/* Row 1: Doctor Name and Rating */}
            <View style={styles.doctorNameRow}>
              <Text style={styles.doctorName}>
                {doctor?.name || "Dr. Sarah Olukoya"}
              </Text>
              <View style={styles.statItem}>
                <Ionicons name="star" size={16} color={Colors.yellow} />
                <Text style={styles.statText}>4.8</Text>
              </View>
            </View>

            {/* Row 2: Specialty and Experience */}
            <View style={styles.doctorSpecialtyRow}>
              <Text style={styles.doctorSpecialty}>Neurologist</Text>
              <Text style={styles.experienceText}>7+ years experience</Text>
            </View>

            {/* Row 3: Language and Price */}
            <View style={styles.doctorLanguageRow}>
              <View style={styles.languageInfo}>
                <Ionicons name="chatbubble" size={16} color={Colors.white} />
                <Text style={styles.languageText}>English</Text>
              </View>
              <Text style={styles.priceText}>₦4,000/session</Text>
            </View>
          </View>
        </View>

        {/* Duration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <View style={styles.durationContainer}>
            <Text style={styles.durationText}>30:08 mins</Text>
            <View style={styles.completedTag}>
              <Text style={styles.completedText}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Doctor's Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Doctors Recommendation</Text>
          {recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </View>

        {/* Doctor's Prescription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Doctor's Prescription</Text>
          {prescriptions.map((medication) => (
            <View key={medication.id} style={styles.medicationCard}>
              <View style={styles.medicationImage}>
                <Ionicons name="medical" size={20} color={Colors.primary} />
              </View>
              <View style={styles.medicationInfo}>
                <View style={styles.medicationHeader}>
                  <Text style={styles.medicationName}>{medication.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color={Colors.yellow} />
                    <Text style={styles.ratingText}>{medication.rating}</Text>
                  </View>
                </View>
                <Text style={styles.medicationDosage}>{medication.dosage}</Text>
                <Text style={styles.medicationDescription}>
                  {medication.description}
                </Text>
                <View style={styles.medicationFooter}>
                  <Text style={styles.medicationPrice}>{medication.price}</Text>
                  <TouchableOpacity style={styles.addToCartButton}>
                    <Text style={styles.addToCartText}>Add to cart</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {medication.inStock && (
                <View style={styles.inStockTag}>
                  <Text style={styles.inStockText}>In stock</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Feedback Section */}
        <View style={styles.feedbackSection}>
          <Text style={styles.sectionTitle}>Rate Your Experience</Text>
          <Text style={styles.feedbackQuestion}>
            How was your consultation?
          </Text>

          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={24}
                  color={star <= rating ? Colors.yellow : Colors.grey}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.feedbackLabel}>
            Additional Feedback (optional)
          </Text>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Share your experience with Dr. Sarah Olukoya..."
              placeholderTextColor={Colors.grey}
              value={feedback}
              onChangeText={setFeedback}
              multiline
              maxLength={500}
            />
            <Text style={styles.characterCount}>
              {feedback.length}/500 characters
            </Text>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitFeedback}
          >
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View
        style={[
          styles.bottomActions,
          { paddingBottom: isKeyboardVisible ? 0 : insets.bottom + Sizes.lg },
        ]}
      >
        <TouchableOpacity
          style={styles.backToHomeButton}
          onPress={handleBackToHome}
        >
          <Text style={styles.backToHomeText}>Back to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBookAnother}>
          <Text style={styles.bookAnotherText}>Book Another</Text>
        </TouchableOpacity>
      </View>

      <FeedbackSubmittedModal
        visible={showFeedbackModal}
        onClose={handleModalClose}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    marginRight: Sizes.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.md,
  },
  doctorCard: {
    backgroundColor: "#0098B3",
    borderRadius: 15,
    padding: Sizes.lg,
    marginVertical: Sizes.md,
    flexDirection: "row",
    alignItems: "center",
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.xs,
  },
  doctorName: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
    flex: 1,
  },
  doctorSpecialtyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.xs,
  },
  doctorSpecialty: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
    flex: 1,
  },
  doctorLanguageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  languageInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  languageText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
    marginLeft: Sizes.xs,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
    marginLeft: Sizes.xs,
  },
  experienceText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
  },
  priceText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
  section: {
    marginBottom: Sizes.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
    marginBottom: Sizes.sm,
  },
  durationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  durationText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
  },
  completedTag: {
    backgroundColor: "#E8F5E8",
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    borderRadius: 15,
  },
  completedText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#4CAF50",
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  recommendationText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    marginLeft: Sizes.sm,
  },
  medicationCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: Sizes.md,
    marginBottom: Sizes.sm,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  medicationImage: {
    width: 40,
    height: 40,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.sm,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.xs,
  },
  medicationName: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
    marginRight: Sizes.sm,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    marginLeft: Sizes.xs,
  },
  medicationDosage: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    marginBottom: Sizes.xs,
  },
  medicationDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    marginBottom: Sizes.sm,
  },
  medicationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  medicationPrice: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
  },
  addToCartButton: {
    backgroundColor: "#0098B3",
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    borderRadius: 15,
  },
  addToCartText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
  inStockTag: {
    position: "absolute",
    top: Sizes.sm,
    right: Sizes.sm,
    backgroundColor: "#E8F5E8",
    paddingHorizontal: Sizes.xs,
    paddingVertical: 2,
    borderRadius: 10,
  },
  inStockText: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
    color: "#4CAF50",
  },
  feedbackSection: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: Sizes.md,
    marginBottom: Sizes.xl,
  },
  feedbackQuestion: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    marginBottom: Sizes.sm,
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: Sizes.md,
  },
  starButton: {
    marginRight: Sizes.sm,
  },
  feedbackLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    marginBottom: Sizes.sm,
  },
  textInputContainer: {
    marginBottom: Sizes.md,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: Sizes.sm,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    minHeight: 80,
    textAlignVertical: "top",
  },
  characterCount: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    textAlign: "right",
    marginTop: Sizes.xs,
  },
  submitButton: {
    borderWidth: 1,
    borderColor: "#0098B3",
    borderRadius: 25,
    paddingVertical: Sizes.sm,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#0098B3",
  },
  bottomActions: {
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  backToHomeButton: {
    backgroundColor: "#0098B3",
    borderRadius: 25,
    paddingVertical: Sizes.md,
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  backToHomeText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
  },
  bookAnotherText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#0098B3",
    textAlign: "center",
  },
});

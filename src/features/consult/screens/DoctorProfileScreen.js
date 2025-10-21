import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

const { height } = Dimensions.get("window");

// Import components
import DoctorProfileHeader from "../components/DoctorProfileHeader";
import DoctorProfileCard from "../components/DoctorProfileCard";
import AboutSection from "../components/AboutSection";
import EducationSection from "../components/EducationSection";
import CertificationsSection from "../components/CertificationsSection";
import WorkingHoursSection from "../components/WorkingHoursSection";
import PatientsReviewSection from "../components/PatientsReviewSection";
import BookNowButton from "../components/BookNowButton";

export default function DoctorProfileScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { doctor } = route.params || {};

  // Default doctor data if none provided
  const defaultDoctor = {
    name: "Dr. Sarah Olukoya",
    specialty: "Neurologist",
    rating: 4.8,
    experience: "7+ years experience",
    languages: "English",
    price: "₦4,000/session",
    isAvailable: true,
  };

  const doctorData = doctor || defaultDoctor;

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleBookNow = () => {
    console.log("Book now pressed for:", doctorData.name);
    // Implement booking functionality
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ImageBackground
          source={Images.bgImg}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* Header */}
          <DoctorProfileHeader onBackPress={handleBackPress} />

          {/* Doctor Profile Card - Compact like home screen */}
          <DoctorProfileCard doctor={doctor} />
        </ImageBackground>

        {/* Content with curved top */}
        <View style={styles.contentWrapper}>
          {/* Content Sections */}
          <View style={styles.contentContainer}>
            <AboutSection doctor={doctor} />
            <EducationSection doctor={doctor} />
            <CertificationsSection doctor={doctor} />
            <WorkingHoursSection doctor={doctor} />
            <PatientsReviewSection doctor={doctor} />
          </View>
        </View>
      </ScrollView>

      {/* Book Now Button - Sticky to bottom */}
      <View
        style={[styles.bookButtonContainer, { paddingBottom: insets.bottom }]}
      >
        <BookNowButton doctor={doctor} onPress={handleBookNow} />
      </View>
    </SafeAreaView>
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

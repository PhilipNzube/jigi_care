import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";

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

// Skeleton Components
function DoctorProfileSkeleton({ insets }) {
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
            {/* About Section Skeleton */}
            <ShimmerLoader>
              <View style={styles.skeletonSection}>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonText} />
                <View style={[styles.skeletonText, { width: "80%" }]} />
              </View>
            </ShimmerLoader>

            {/* Education Section Skeleton */}
            <ShimmerLoader>
              <View style={styles.skeletonSection}>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonText} />
              </View>
            </ShimmerLoader>

            {/* Certifications Section Skeleton */}
            <ShimmerLoader>
              <View style={styles.skeletonSection}>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonText} />
              </View>
            </ShimmerLoader>

            {/* Working Hours Section Skeleton */}
            <ShimmerLoader>
              <View style={styles.skeletonSection}>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonText} />
              </View>
            </ShimmerLoader>

            {/* Reviews Section Skeleton */}
            <ShimmerLoader>
              <View style={styles.skeletonSection}>
                <View style={styles.skeletonTitle} />
                {[1, 2].map((index) => (
                  <View key={index} style={styles.skeletonReviewCard} />
                ))}
              </View>
            </ShimmerLoader>
          </View>
        </View>
      </ScrollView>

      {/* Book Button Skeleton */}
      <View style={[styles.bookButtonContainer, { paddingBottom: insets.bottom }]}>
        <ShimmerLoader>
          <View style={styles.skeletonButton} />
        </ShimmerLoader>
      </View>
    </View>
  );
}

export default function DoctorProfileScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { doctor } = route.params || {};
  const [isLoading, setIsLoading] = useState(!doctor);

  // Default doctor data if none provided
  const defaultDoctor = {
    name: "Dr. Unknown",
    specialty: "General Practitioner",
    rating: 4.5,
    experience: "Experienced",
    languages: "English",
    price: "Contact for pricing",
    isAvailable: false,
    consultantData: {},
  };

  const doctorData = doctor || defaultDoctor;

  useEffect(() => {
    // Simulate loading if doctor data is not immediately available
    if (!doctor) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [doctor]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleBookNow = () => {
    // Navigate to BookConsultationScreen with doctor data
    navigation.navigate("BookConsultation", { doctor: doctorData });
  };

  if (isLoading) {
    return <DoctorProfileSkeleton insets={insets} />;
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
          <DoctorProfileHeader onBackPress={handleBackPress} />

          {/* Doctor Profile Card - Compact like home screen */}
          <DoctorProfileCard doctor={doctorData} />
        </ImageBackground>

        {/* Content with curved top */}
        <View style={styles.contentWrapper}>
          {/* Content Sections */}
          <View style={styles.contentContainer}>
            <AboutSection doctor={doctorData} />
            <EducationSection doctor={doctorData} />
            <CertificationsSection doctor={doctorData} />
            <WorkingHoursSection doctor={doctorData} />
            <PatientsReviewSection doctor={doctorData} />
          </View>
        </View>
      </ScrollView>

      {/* Book Now Button - Sticky to bottom */}
      <View
        style={[styles.bookButtonContainer, { paddingBottom: insets.bottom }]}
      >
        <BookNowButton
          doctor={doctorData}
          onPress={handleBookNow}
          navigation={navigation}
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
    width: "60%",
    height: 20,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginBottom: Sizes.md,
  },
  skeletonText: {
    width: "100%",
    height: 16,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginBottom: Sizes.xs,
  },
  skeletonReviewCard: {
    height: 100,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
    marginBottom: Sizes.md,
  },
  skeletonButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.lightGray,
  },
});

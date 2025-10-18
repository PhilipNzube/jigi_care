import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import Button from "../../../shared/components/Button";

const { width, height } = Dimensions.get("window");

const onboardingData = [
  {
    id: 1,
    image: Images.onboarding1,
    title: "Healthcare that comes to you",
    description:
      "Book appointments, talk to doctors, order prescriptions, and manage your health from home.",
  },
  {
    id: 2,
    image: Images.onboarding2,
    title: "Doctors just a call away",
    description:
      "Chat or video call with licensed doctors for instant advice and prescriptions.",
  },
  {
    id: 3,
    image: Images.onboarding3,
    title: "Stay on top of your Health",
    description:
      "Get reminders, track your health, and manage everything in one easy app.",
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    } else {
      navigation.replace("Welcome");
    }
  };

  const handleSkip = () => {
    navigation.replace("Welcome");
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const renderSlide = (item, index) => (
    <View key={item.id} style={styles.slide}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.slideImage} />
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {onboardingData.map((item, index) => renderSlide(item, index))}
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        {/* Continue Button */}
        <Button
          title="Continue"
          variant="primary"
          size="lg"
          onPress={handleNext}
          style={styles.continueButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 1,
    padding: Sizes.sm,
  },
  skipText: {
    fontSize: Sizes.fontSize.md,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Sizes.xl,
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  slideImage: {
    width: width * 0.8,
    height: height * 0.4,
    resizeMode: "contain",
  },
  contentContainer: {
    flex: 0.4,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: Sizes.lg,
    lineHeight: 36,
  },
  slideDescription: {
    fontSize: Sizes.fontSize.md,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  bottomContainer: {
    paddingHorizontal: Sizes.xl,
    paddingBottom: Sizes.xxl,
    paddingTop: Sizes.lg,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Sizes.xl,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  continueButton: {
    width: "100%",
  },
});

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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import Button from "../../../shared/components/Button";

const { width, height } = Dimensions.get("window");

const onboardingData = [
  {
    id: 1,
    image: Images.onboarding1,
    title: "Healthcare that comes to you",
    titleHighlight: "Healthcare",
    description:
      "Book appointments, talk to doctors, order prescriptions, and manage your health from home.",
  },
  {
    id: 2,
    image: Images.onboarding2,
    title: "Doctors just a call away",
    titleHighlight: "Doctors",
    description:
      "Chat or video call with licensed doctors for instant advice and prescriptions.",
  },
  {
    id: 3,
    image: Images.onboarding3,
    title: "Stay on top of your Health",
    titleHighlight: "Health",
    description:
      "Get reminders, track your health, and manage everything in one easy app.",
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const insets = useSafeAreaInsets();

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

  const renderSlide = (item, index) => {
    const titleParts = item.title.split(item.titleHighlight);
    return (
      <View key={item.id} style={styles.slide}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.slideImage} />
        </View>

        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {onboardingData.map((_, dotIndex) => (
            <View
              key={dotIndex}
              style={[
                styles.paginationDot,
                dotIndex === index && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          <View style={styles.textWrapper}>
            <Text
              style={styles.slideTitle}
              includeFontPadding={false}
              textAlignVertical="center"
              numberOfLines={3}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.85}
            >
              {titleParts[0]}
              <Text
                style={styles.slideTitleHighlight}
                includeFontPadding={false}
                textAlignVertical="center"
              >
                {item.titleHighlight}
              </Text>
              {titleParts[1]}
            </Text>
          </View>
          <View style={styles.textWrapper}>
            <Text
              style={styles.slideDescription}
              includeFontPadding={false}
              textAlignVertical="center"
              numberOfLines={3}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.85}
            >
              {item.description}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom }]}>
        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleNext}>
          <Text
            style={styles.continueButtonText}
            includeFontPadding={false}
            textAlignVertical="center"
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.85}
          >
            Continue
          </Text>
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text
            style={styles.skipText}
            includeFontPadding={false}
            textAlignVertical="center"
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.85}
          >
            Skip
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width,
    flex: 1,
  },
  imageContainer: {
    flex: 0.6,
    width: "100%",
  },
  slideImage: {
    width: width,
    height: height * 0.6,
    resizeMode: "cover",
  },
  contentContainer: {
    flex: 0.4,
    justifyContent: "center",
    alignItems: "center",
    whiteSpace: "wrap",
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.sm,
    width: "100%",
  },
  textWrapper: {
    width: "100%",
    alignItems: "center",
  },
  slideTitle: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Sizes.lg,
    lineHeight: 36,
    width: "100%",
  },
  slideTitleHighlight: {
    color: Colors.primary,
  },
  slideDescription: {
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    width: "100%",
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
    paddingHorizontal: Sizes.xl,
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
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Sizes.md,
  },
  continueButtonText: {
    fontSize: Sizes.fontSize.lg,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: Sizes.md,
    height: 56,
  },
  skipText: {
    flex: 1,
    fontSize: Sizes.fontSize.md,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import { useAuth } from "../../../shared/context/AuthContext";

const { width, height } = Dimensions.get("window");

export default function HeroSection({ insets, navigation }) {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef(null);
  const autoScrollIntervalRef = useRef(null);

  // Extract first name from fullName for greeting
  const getFirstName = () => {
    if (!user) return "there";
    const fullName = user?.fullName || user?.name || "";
    const firstName = fullName.split(" ")[0];
    return firstName || "there";
  };

  const firstName = getFirstName();

  const heroSlides = [
    {
      id: 1,
      title: "How are you feeling today?",
      subtitle: "We're here to help you feel better",
      buttonText: "Book Appointment",
      image: Images.bgImg,
    },
    {
      id: 2,
      title: "Your Health Matters",
      subtitle: "Get personalized care from our experts",
      buttonText: "Consult Now",
      image: Images.bgImg,
    },
    {
      id: 3,
      title: "Stay Healthy",
      subtitle: "Track your health with our tools",
      buttonText: "Get Started",
      image: Images.bgImg,
    },
  ];

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setCurrentSlide(Math.round(index));
  };

  const scrollToSlide = (index) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
  };

  // Auto-scroll carousel
  useEffect(() => {
    autoScrollIntervalRef.current = setInterval(() => {
      const nextSlide = (currentSlide + 1) % heroSlides.length;
      scrollToSlide(nextSlide);
      setCurrentSlide(nextSlide);
    }, 4000); // Change slide every 4 seconds

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [currentSlide]);

  const handleButtonPress = (buttonText) => {
    if (buttonText === "Book Appointment" || buttonText === "Consult Now") {
      // Navigate to Consult tab in bottom nav
      navigation.navigate("BottomTabs", { screen: "consult" });
    } else if (buttonText === "Get Started") {
      // Navigate to Health Monitoring page
      navigation.navigate("HealthMonitoring");
    }
  };

  return (
    <View style={[styles.heroContainer, { paddingTop: insets.top }]}>
      <ImageBackground
        source={Images.bgImg}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.curvedBottom} />
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                <Ionicons name="person" size={30} color={Colors.white} />
              </View>
              <View style={styles.greetingSection}>
                <Text
                  style={styles.greetingText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Hello {firstName},
                </Text>
                <Text
                  style={styles.subGreetingText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  How are you feeling today?
                </Text>
              </View>
            </View>
            <View style={styles.notificationContainer}>
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => navigation.navigate("Notifications")}
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={Colors.white}
                />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Carousel */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          style={styles.carousel}
        >
          {heroSlides.map((slide) => (
            <View key={slide.id} style={styles.slide}>
              <View style={styles.slideContent}>
                <Text style={styles.slideTitle}>{slide.title}</Text>
                <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => handleButtonPress(slide.buttonText)}
                >
                  <Text style={styles.bookButtonText}>{slide.buttonText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {heroSlides.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationDot,
                currentSlide === index && styles.activePaginationDot,
              ]}
              onPress={() => scrollToSlide(index)}
            />
          ))}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    height: height * 0.65,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    position: "relative",
  },
  curvedBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  headerContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: 20,
    marginHorizontal: Sizes.lg,
    marginTop: Sizes.lg,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.lg,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
  },
  greetingSection: {},
  notificationContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: 8,
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.sm,
  },
  greetingText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
  subGreetingText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
    opacity: 0.8,
  },
  notificationButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  notificationDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E74C3C",
  },
  carousel: {
    flex: 1,
  },
  slide: {
    width: width,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Sizes.xxl,
  },
  slideContent: {
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: 20,
    padding: Sizes.xl,
    marginHorizontal: Sizes.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 0,
  },
  slideTitle: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
    textAlign: "center",
    marginBottom: Sizes.sm,
  },
  slideSubtitle: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
    textAlign: "center",
    marginBottom: Sizes.lg,
    opacity: 0.9,
  },
  bookButton: {
    backgroundColor: Colors.white,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.xl,
    borderRadius: 25,
  },
  bookButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.primary,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: Sizes.xl,
    marginBottom: Sizes.sm,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    marginHorizontal: 4,
  },
  activePaginationDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
});

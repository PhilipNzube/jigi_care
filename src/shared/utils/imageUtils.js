// Image utility functions for JigiCare app
import { Image } from "react-native";

// Image sources - just like Flutter's AssetImage
export const Images = {
  // App icons
  appIcon: require("../../../assets/images/app_icon.png"),

  // Health icons (using app icon as placeholder for now)
  heart: require("../../../assets/images/app_icon.png"),
  medicine: require("../../../assets/images/app_icon.png"),
  calendar: require("../../../assets/images/app_icon.png"),
  user: require("../../../assets/images/app_icon.png"),

  // Placeholder images (using app icon as placeholder for now)
  placeholder: require("../../../assets/images/app_icon.png"),
  avatar: require("../../../assets/images/app_icon.png"),

  // Onboarding images
  splashImg: require("../../../assets/images/splash_img.png"),
  onboarding1: require("../../../assets/images/onboarding_1.png"),
  onboarding2: require("../../../assets/images/onboarding_2.png"),
  onboarding3: require("../../../assets/images/onboarding_3.png"),
  onboarding4: require("../../../assets/images/onboarding_4.png"),

  // Biometric images
  facialRecognition: require("../../../assets/images/facial_recognition.png"),
  fingerPrint: require("../../../assets/images/finger_print.png"),

  // Loading images
  loader: require("../../../assets/images/loader.png"),

  // Social login images
  google: require("../../../assets/images/google.png"),
  // Navigation Icons
  homeIcon: require("../../../assets/images/home_icon.png"),
  homeIconActive: require("../../../assets/images/home_icon_active.png"),
  consultIcon: require("../../../assets/images/consult_icon.png"),
  consultIconActive: require("../../../assets/images/consult_icon_active.png"),
  medicationIcon: require("../../../assets/images/medication_icon.png"),
  medicationIconActive: require("../../../assets/images/medication_icon_active.png"),
  profileIcon: require("../../../assets/images/profile_icon.png"),
  profileIconActive: require("../../../assets/images/profile_icon_active.png"),
  // Health Content
  healthTips: require("../../../assets/images/health_tips.png"),

  // Background images
  bgImg: require("../../../assets/images/bg_img.png"),

  // Quick action images
  consult: require("../../../assets/images/consult.png"),
  medications: require("../../../assets/images/medications.png"),
  labTest: require("../../../assets/images/lab_test.png"),
  healthMonitoring: require("../../../assets/images/health_monitoring.png"),

  // Emergency image
  emergency: require("../../../assets/images/emergency.png"),

  // Booking image
  booking: require("../../../assets/images/booking.png"),
};

// Helper function to get image source
export const getImageSource = (imageName) => {
  return Images[imageName] || Images.placeholder;
};

// Helper function to preload images (like Flutter's precacheImage)
export const preloadImages = async (imageNames) => {
  const promises = imageNames.map((name) => {
    const source = getImageSource(name);
    return Image.prefetch(Image.resolveAssetSource(source).uri);
  });

  try {
    await Promise.all(promises);
    console.log("Images preloaded successfully");
  } catch (error) {
    console.error("Error preloading images:", error);
  }
};

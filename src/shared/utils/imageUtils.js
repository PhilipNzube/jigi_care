// Image utility functions for JijiCare app
import { Image } from "react-native";

// Image sources - just like Flutter's AssetImage
export const Images = {
  // App icons
  appIcon: require("../../../assets/images/app_icon.png"),
  logo: require("../../assets/images/logo.png"),
  logoWhite: require("../../assets/images/logo-white.png"),

  // Health icons
  heart: require("../../assets/icons/heart.png"),
  medicine: require("../../assets/icons/medicine.png"),
  calendar: require("../../assets/icons/calendar.png"),
  user: require("../../assets/icons/user.png"),

  // Placeholder images
  placeholder: require("../../assets/images/placeholder.png"),
  avatar: require("../../assets/images/avatar-placeholder.png"),

  // Onboarding images
  splashImg: require("../../../assets/images/splash_img.png"),
  onboarding1: require("../../../assets/images/onboarding_1.png"),
  onboarding2: require("../../../assets/images/onboarding_2.png"),
  onboarding3: require("../../../assets/images/onboarding_3.png"),
  onboarding4: require("../../../assets/images/onboarding_4.png"),
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

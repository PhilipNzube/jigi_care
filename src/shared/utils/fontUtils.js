import * as Font from "expo-font";

// Font loading utility for JigiCare app
export const loadFonts = async () => {
  try {
    await Font.loadAsync({
      "Poppins-Regular": require("../../../assets/fonts/Poppins/Poppins-Regular.ttf"),
      "Poppins-Medium": require("../../../assets/fonts/Poppins/Poppins-Medium.ttf"),
      "Poppins-SemiBold": require("../../../assets/fonts/Poppins/Poppins-SemiBold.ttf"),
      "Poppins-Bold": require("../../../assets/fonts/Poppins/Poppins-Bold.ttf"),
      "Poppins-Light": require("../../../assets/fonts/Poppins/Poppins-Light.ttf"),
      "Poppins-ExtraLight": require("../../../assets/fonts/Poppins/Poppins-ExtraLight.ttf"),
      "Poppins-Thin": require("../../../assets/fonts/Poppins/Poppins-Thin.ttf"),
      "Poppins-Black": require("../../../assets/fonts/Poppins/Poppins-Black.ttf"),
      "Poppins-ExtraBold": require("../../../assets/fonts/Poppins/Poppins-ExtraBold.ttf"),
    });
    console.log("Fonts loaded successfully");
  } catch (error) {
    console.warn("Error loading fonts:", error);
  }
};

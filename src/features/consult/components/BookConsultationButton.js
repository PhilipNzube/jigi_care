import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

export default function BookConsultationButton({
  doctor,
  onPress,
  isLoading,
  isDisabled = false,
}) {
  const spinValue = React.useRef(new Animated.Value(0)).current;
  
  // Get consultation fee from doctor data
  const consultantData = doctor?.consultantData || {};
  const consultationFee = consultantData.pricePerSession || 4000; // Fallback to 4000 if not available
  const serviceFee = 500; // Service fee
  const total = consultationFee + serviceFee;

  React.useEffect(() => {
    if (isLoading) {
      startSpinning();
    } else {
      stopSpinning();
    }
  }, [isLoading]);

  const startSpinning = () => {
    spinValue.setValue(0);
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopSpinning = () => {
    spinValue.stopAnimation();
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isLoading && styles.buttonLoading,
        isDisabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={isLoading || isDisabled}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Animated.Image
            source={Images.loader}
            style={[styles.loader, { transform: [{ rotate: spin }] }]}
          />
        </View>
      ) : (
        <Text
          style={[styles.buttonText, isDisabled && styles.buttonTextDisabled]}
        >
          Book Consultation - ₦{total.toLocaleString()}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#0098B3",
    borderRadius: 30,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  buttonLoading: {
    backgroundColor: "#007A8B",
  },
  buttonDisabled: {
    backgroundColor: "#0098B3",
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
  buttonTextDisabled: {
    color: Colors.white,
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    width: 32,
    height: 32,
    marginRight: Sizes.sm,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
});

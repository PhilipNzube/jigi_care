import React from "react";
import { TouchableOpacity, Text, StyleSheet, Animated } from "react-native";
import { Colors, Sizes } from "../constants";
import { Images } from "../utils/imageUtils";

export default function LoadingButton({
  title,
  onPress,
  isLoading,
  disabled,
  style,
  textStyle,
  spinValue,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        style,
        (disabled || isLoading) && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <Animated.Image
          source={Images.loader}
          style={[
            styles.loadingImage,
            {
              transform: [
                {
                  rotate: spinValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            },
          ]}
        />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Sizes.md,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
  },
  loadingImage: {
    width: 32,
    height: 32,
  },
});

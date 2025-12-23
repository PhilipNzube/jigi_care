/**
 * Loading Overlay Component
 * Reusable full-screen loading overlay with spinner
 */

import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Modal } from "react-native";
import { Images } from "../utils/imageUtils";

export default function LoadingOverlay({ visible = false }) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      startSpinning();
    } else {
      stopSpinning();
    }
  }, [visible]);

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
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.Image
          source={Images.loader}
          style={[
            styles.loader,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    width: 60,
    height: 60,
    tintColor: "#FFFFFF",
  },
});


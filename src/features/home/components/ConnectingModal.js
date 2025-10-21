import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

const { width } = Dimensions.get("window");

export default function ConnectingModal({ visible, doctorName = "Dr. Sarah" }) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log("ConnectingModal visible:", visible);
    if (visible) {
      const spin = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spin.start();
      return () => spin.stop();
    } else {
      spinValue.setValue(0);
    }
  }, [visible, spinValue]);

  const renderLoadingSpinner = () => {
    return (
      <Animated.Image
        source={Images.loader}
        style={[
          styles.loadingSpinner,
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
    );
  };

  console.log("ConnectingModal render - visible:", visible);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.connectingText}>
            Connecting with {doctorName}...
          </Text>
          <Text style={styles.subText}>
            Your consultation is about to start.
          </Text>
          <View style={styles.loadingButton}>{renderLoadingSpinner()}</View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Sizes.xl,
    marginHorizontal: Sizes.lg,
    alignItems: "center",
    minWidth: width * 0.8,
    maxWidth: width * 0.9,
  },
  connectingText: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#333333",
    textAlign: "center",
    marginBottom: Sizes.sm,
  },
  subText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#808080",
    textAlign: "center",
    marginBottom: Sizes.xl,
  },
  loadingButton: {
    backgroundColor: "#0098B3",
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.xl,
    borderRadius: 25,
    minWidth: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingSpinner: {
    width: 32,
    height: 32,
  },
});

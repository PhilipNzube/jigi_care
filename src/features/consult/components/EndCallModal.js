import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function EndCallModal({ visible, onClose, onConfirm }) {
  const handleOverlayPress = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleOverlayPress}
      >
        <TouchableOpacity
          style={styles.modal}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="call" size={24} color={Colors.white} />
          </View>

          {/* Question */}
          <Text style={styles.questionText}>
            Are you sure you want to end this consultation?
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.continueButton} onPress={onClose}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.endButton} onPress={onConfirm}>
              <Text style={styles.endButtonText}>End Call</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
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
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Sizes.xl,
    marginHorizontal: Sizes.xl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  questionText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    textAlign: "center",
    marginBottom: Sizes.xl,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  continueButton: {
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: Colors.white,
    marginRight: Sizes.sm,
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    textAlign: "center",
  },
  endButton: {
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    borderRadius: 25,
    backgroundColor: "#FF6B6B",
    marginLeft: Sizes.sm,
    alignItems: "center",
  },
  endButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
    textAlign: "center",
  },
});

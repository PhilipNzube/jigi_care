import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function ThankYouModal({ visible, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
          </View>

          <Text style={styles.title}>Thank You</Text>
          <Text style={styles.subtitle}>Your request has been submitted.</Text>
        </View>
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
  overlayTouchable: {
    flex: 1,
    width: "100%",
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Sizes.xl,
    marginHorizontal: Sizes.lg,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: Sizes.lg,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: Sizes.sm,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    textAlign: "center",
  },
});








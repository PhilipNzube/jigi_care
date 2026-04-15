import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../constants";

export default function DeclineConfirmationModal({ visible, onContinue, onCancel }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onCancel} />
        <View
          style={[
            styles.modal,
            { paddingBottom: Math.max(insets.bottom, Sizes.xl) },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>DECLINE PRIVACY POLICY?</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.grey} />
            </TouchableOpacity>
          </View>

          <Text style={styles.message}>
            Declining the Privacy Policy will sign you out. It is required to accept the policy to continue using JIGI Care.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmButton} onPress={onContinue}>
              <Text style={styles.confirmButtonText}>Yes, Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  overlayTouchable: {
    flex: 1,
  },
  modal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Sizes.lg,
    paddingHorizontal: Sizes.lg,
    paddingBottom: Sizes.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.grey,
  },
  closeButton: {
    padding: Sizes.xs,
  },
  message: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    textAlign: "center",
    marginBottom: Sizes.xl,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingVertical: Sizes.md,
    borderRadius: 25,
    alignItems: "center",
    marginRight: Sizes.sm,
  },
  cancelButtonText: {
    color: Colors.grey,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#F44336", // Standard error/confirm red
    paddingVertical: Sizes.md,
    borderRadius: 25,
    alignItems: "center",
    marginLeft: Sizes.sm,
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
});

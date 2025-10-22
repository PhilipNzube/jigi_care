import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function LogoutModal({ visible, onClose, onConfirm }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>LOG OUT</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.grey} />
            </TouchableOpacity>
          </View>

          <Text style={styles.message}>Are you sure you want to log out?</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmButtonText}>Yes, Log out</Text>
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
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Sizes.xl,
    marginHorizontal: Sizes.lg,
    width: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
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
    backgroundColor: "#F44336",
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

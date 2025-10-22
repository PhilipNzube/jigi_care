import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function UpdateDataModal({ visible, onClose }) {
  const [weight, setWeight] = useState("64.00");
  const [height, setHeight] = useState("5.80");
  const [bloodType, setBloodType] = useState("0+");

  const handleSave = () => {
    // Handle save logic
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>UPDATE DATA</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.grey} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="scale" size={20} color={Colors.grey} />
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
                <Text style={styles.unit}>Kg</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.grey} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Height</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="resize" size={20} color={Colors.grey} />
                <TextInput
                  style={styles.input}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                />
                <Text style={styles.unit}>ft</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.grey} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Blood Type</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="water" size={20} color={Colors.grey} />
                <TextInput
                  style={styles.input}
                  value={bloodType}
                  onChangeText={setBloodType}
                />
                <Ionicons name="chevron-down" size={16} color={Colors.grey} />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
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
    fontFamily: "Poppins-Bold",
    color: Colors.grey,
  },
  closeButton: {
    padding: Sizes.xs,
  },
  content: {
    marginBottom: Sizes.lg,
  },
  inputGroup: {
    marginBottom: Sizes.lg,
  },
  label: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    marginBottom: Sizes.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: Sizes.sm,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginLeft: Sizes.sm,
  },
  unit: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    marginRight: Sizes.xs,
  },
  saveButton: {
    backgroundColor: "#0098B3",
    paddingVertical: Sizes.md,
    borderRadius: 25,
    alignItems: "center",
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
});

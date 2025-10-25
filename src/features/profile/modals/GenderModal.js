import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";

export default function GenderModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const [selectedGender, setSelectedGender] = useState("Male");

  const genders = [
    { id: "male", label: "Male", icon: "male" },
    { id: "female", label: "Female", icon: "female" },
    { id: "other", label: "Other", icon: "person" },
    {
      id: "prefer_not_to_say",
      label: "Prefer not to say",
      icon: "help-circle",
    },
  ];

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
        <View
          style={[
            styles.modal,
            { paddingBottom: Math.max(insets.bottom, Sizes.xl) },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>SELECT GENDER</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.grey} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {genders.map((gender) => (
              <TouchableOpacity
                key={gender.id}
                style={[
                  styles.genderItem,
                  selectedGender === gender.label && styles.selectedGenderItem,
                ]}
                onPress={() => setSelectedGender(gender.label)}
              >
                <View style={styles.genderInfo}>
                  <Ionicons
                    name={gender.icon}
                    size={24}
                    color={
                      selectedGender === gender.label ? "#0098B3" : Colors.grey
                    }
                  />
                  <Text
                    style={[
                      styles.genderLabel,
                      selectedGender === gender.label &&
                        styles.selectedGenderLabel,
                    ]}
                  >
                    {gender.label}
                  </Text>
                </View>
                {selectedGender === gender.label && (
                  <Ionicons name="checkmark" size={20} color="#0098B3" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

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
    maxHeight: "80%",
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
  content: {
    marginBottom: Sizes.lg,
  },
  genderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.md,
    borderRadius: 8,
    marginBottom: Sizes.sm,
    backgroundColor: "#F8F8F8",
  },
  selectedGenderItem: {
    backgroundColor: "#E0F7FA",
    borderWidth: 1,
    borderColor: "#0098B3",
  },
  genderInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  genderLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginLeft: Sizes.md,
  },
  selectedGenderLabel: {
    color: "#0098B3",
    fontFamily: "Poppins-Bold",
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

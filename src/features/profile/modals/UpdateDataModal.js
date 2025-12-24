import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import { useAuth } from "../../../shared/context/AuthContext";
import { updateProfile } from "../../auth/services/authService";
import LoadingOverlay from "../../../shared/components/LoadingOverlay";
import { showError, showSuccess } from "../../../shared/utils/toast";

export default function UpdateDataModal({ visible, onClose, field }) {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bloodGroup, setBloodGroup] = useState("A");
  const [bloodRh, setBloodRh] = useState("+");
  const [isLoading, setIsLoading] = useState(false);
  const weightInputRef = useRef(null);
  const heightInputRef = useRef(null);
  
  // Blood type options
  const bloodGroups = ["A", "B", "AB", "O"];
  const bloodRhOptions = ["+", "-"];

  // Initialize with user's data when modal opens
  useEffect(() => {
    if (visible && user) {
      if (field === "weight") {
        const weightValue = user?.weight ? user.weight.replace(/kg|Kg|KG|lbs|Lbs|LBS/g, "").trim() : "";
        setWeight(weightValue);
        // Auto-focus weight input when modal opens
        setTimeout(() => {
          weightInputRef.current?.focus();
        }, 300);
      } else if (field === "height") {
        const heightValue = user?.height ? user.height.replace(/ft|Ft|FT|cm|Cm|CM|'|"|in|In|IN/g, "").trim() : "";
        setHeight(heightValue);
        // Auto-focus height input when modal opens
        setTimeout(() => {
          heightInputRef.current?.focus();
        }, 300);
      } else if (field === "bloodType") {
        const bloodTypeValue = user?.bloodType || "";
        if (bloodTypeValue) {
          // Parse blood type (e.g., "A+", "O-")
          const match = bloodTypeValue.match(/^([ABO]+)([+-])$/i);
          if (match) {
            setBloodGroup(match[1].toUpperCase());
            setBloodRh(match[2]);
          } else {
            // Try to extract group and rh separately
            const group = bloodGroups.find(g => bloodTypeValue.toUpperCase().includes(g));
            const rh = bloodRhOptions.find(r => bloodTypeValue.includes(r));
            if (group) setBloodGroup(group);
            if (rh) setBloodRh(rh);
          }
        }
      }
    }
  }, [visible, user, field]);

  const handleSave = async () => {
    setIsLoading(true);

    try {
      let updateData = {};
      
      if (field === "weight") {
        if (!weight.trim()) {
          showError("Weight cannot be empty");
          setIsLoading(false);
          return;
        }
        updateData.weight = `${weight.trim()}kg`;
      } else if (field === "height") {
        if (!height.trim()) {
          showError("Height cannot be empty");
          setIsLoading(false);
          return;
        }
        updateData.height = `${height.trim()}cm`;
      } else if (field === "bloodType") {
        updateData.bloodType = `${bloodGroup}${bloodRh}`;
      }

      const updatedUser = await updateProfile(updateData);
      await updateUser(updatedUser);
      showSuccess(`${field === "weight" ? "Weight" : field === "height" ? "Height" : "Blood type"} updated successfully!`);
      onClose();
    } catch (err) {
      console.error(`❌ [UPDATE ${field?.toUpperCase()}] Error updating ${field}:`, err);
      showError(err.message || `Failed to update ${field}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (field === "weight") return "UPDATE WEIGHT";
    if (field === "height") return "UPDATE HEIGHT";
    if (field === "bloodType") return "UPDATE BLOOD TYPE";
    return "UPDATE DATA";
  };

  const getLabel = () => {
    if (field === "weight") return "Weight";
    if (field === "height") return "Height";
    if (field === "bloodType") return "Blood Type";
    return "";
  };

  const getUnit = () => {
    if (field === "weight") return "kg";
    if (field === "height") return "cm";
    return "";
  };

  const getIcon = () => {
    if (field === "weight") return "scale";
    if (field === "height") return "resize";
    if (field === "bloodType") return "water";
    return "";
  };

  const handleWeightChange = (text) => {
    // Only allow numbers and decimal point
    const numericValue = text.replace(/[^0-9.]/g, "");
    setWeight(numericValue);
  };

  const handleHeightChange = (text) => {
    // Only allow numbers and decimal point
    const numericValue = text.replace(/[^0-9.]/g, "");
    setHeight(numericValue);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />
        <View
          style={[
            styles.modal,
            { paddingBottom: Math.max(insets.bottom, Sizes.xl) },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.title}>{getTitle()}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              {field === "weight" && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{getLabel()}</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name={getIcon()} size={20} color={Colors.grey} />
                    <TextInput
                      ref={weightInputRef}
                      style={styles.input}
                      value={weight}
                      onChangeText={handleWeightChange}
                      keyboardType="numeric"
                      placeholder="Enter weight"
                      placeholderTextColor={Colors.grey}
                    />
                    <Text style={styles.unit}>{getUnit()}</Text>
                  </View>
                </View>
              )}

              {field === "height" && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{getLabel()}</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name={getIcon()} size={20} color={Colors.grey} />
                    <TextInput
                      ref={heightInputRef}
                      style={styles.input}
                      value={height}
                      onChangeText={handleHeightChange}
                      keyboardType="numeric"
                      placeholder="Enter height"
                      placeholderTextColor={Colors.grey}
                    />
                    <Text style={styles.unit}>{getUnit()}</Text>
                  </View>
                </View>
              )}

              {field === "bloodType" && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{getLabel()}</Text>
                  <View style={styles.bloodTypeContainer}>
                    <View style={styles.bloodGroupSection}>
                      <Text style={styles.bloodTypeLabel}>Blood Group</Text>
                      <ScrollView
                        style={styles.pickerScrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.pickerContent}
                      >
                        {bloodGroups.map((group) => (
                          <TouchableOpacity
                            key={group}
                            style={[
                              styles.pickerItem,
                              bloodGroup === group && styles.pickerItemSelected,
                            ]}
                            onPress={() => setBloodGroup(group)}
                          >
                            <Text
                              style={[
                                styles.pickerItemText,
                                bloodGroup === group && styles.pickerItemTextSelected,
                              ]}
                            >
                              {group}
                            </Text>
                            {bloodGroup === group && (
                              <Ionicons name="checkmark" size={20} color="#0098B3" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    <View style={styles.bloodRhSection}>
                      <Text style={styles.bloodTypeLabel}>Rh Factor</Text>
                      <ScrollView
                        style={styles.pickerScrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.pickerContent}
                      >
                        {bloodRhOptions.map((rh) => (
                          <TouchableOpacity
                            key={rh}
                            style={[
                              styles.pickerItem,
                              bloodRh === rh && styles.pickerItemSelected,
                            ]}
                            onPress={() => setBloodRh(rh)}
                          >
                            <Text
                              style={[
                                styles.pickerItemText,
                                bloodRh === rh && styles.pickerItemTextSelected,
                              ]}
                            >
                              {rh === "+" ? "Positive (+)" : "Negative (-)"}
                            </Text>
                            {bloodRh === rh && (
                              <Ionicons name="checkmark" size={20} color="#0098B3" />
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                  <View style={styles.selectedBloodType}>
                    <Text style={styles.selectedBloodTypeLabel}>Selected:</Text>
                    <Text style={styles.selectedBloodTypeValue}>
                      {bloodGroup}{bloodRh}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      <LoadingOverlay visible={isLoading} />
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
    maxHeight: "90%",
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
  inputGroup: {
    marginBottom: Sizes.lg,
  },
  label: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#999999",
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
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginLeft: Sizes.xs,
  },
  bloodTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Sizes.sm,
  },
  bloodGroupSection: {
    flex: 1,
    marginRight: Sizes.sm,
  },
  bloodRhSection: {
    flex: 1,
    marginLeft: Sizes.sm,
  },
  bloodTypeLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#999999",
    marginBottom: Sizes.sm,
    textAlign: "center",
  },
  pickerScrollView: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
  },
  pickerContent: {
    paddingVertical: Sizes.xs,
  },
  pickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  pickerItemSelected: {
    backgroundColor: "#E6F7F9",
  },
  pickerItemText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
  },
  pickerItemTextSelected: {
    fontFamily: "Poppins-Medium",
    color: "#0098B3",
  },
  selectedBloodType: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Sizes.lg,
    paddingVertical: Sizes.md,
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
  },
  selectedBloodTypeLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    marginRight: Sizes.sm,
  },
  selectedBloodTypeValue: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#0098B3",
  },
  saveButton: {
    backgroundColor: "#0098B3",
    paddingVertical: Sizes.md,
    borderRadius: 25,
    alignItems: "center",
    marginTop: Sizes.lg,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
});

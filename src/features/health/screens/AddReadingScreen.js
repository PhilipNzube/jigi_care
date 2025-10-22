import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function AddReadingScreen({ navigation, route }) {
  const { type } = route.params || {};
  const [note, setNote] = useState("");
  const [values, setValues] = useState({});

  const readingTypes = {
    blood_pressure: {
      title: "ADD BLOOD PRESSURE",
      fields: [
        { key: "systolic", label: "Systolic", placeholder: "120", unit: "" },
        { key: "diastolic", label: "Diastolic", placeholder: "80", unit: "" },
      ],
      icon: "heart",
      color: "#FF6B6B",
    },
    temperature: {
      title: "ADD TEMPERATURE",
      fields: [
        {
          key: "value",
          label: "Temperature (°F)",
          placeholder: "98.6",
          unit: "°F",
        },
      ],
      icon: "thermometer",
      color: "#9B59B6",
    },
    weight: {
      title: "ADD WEIGHT",
      fields: [
        { key: "value", label: "Weight", placeholder: "64.00", unit: "Kg" },
      ],
      icon: "scale",
      color: "#3498DB",
    },
    heart_rate: {
      title: "ADD HEART RATE",
      fields: [
        { key: "value", label: "Heart Rate", placeholder: "72", unit: "bpm" },
      ],
      icon: "pulse",
      color: "#4ECDC4",
    },
  };

  const currentType = readingTypes[type] || readingTypes.blood_pressure;

  const handleSave = () => {
    // Validate inputs
    const isValid = currentType.fields.every((field) => {
      const value = values[field.key];
      return value && !isNaN(value) && parseFloat(value) > 0;
    });

    if (!isValid) {
      Alert.alert("Invalid Input", "Please enter valid values for all fields.");
      return;
    }

    // Here you would typically save to your data store
    console.log("Saving reading:", { type, values, note });

    Alert.alert("Success", "Reading saved successfully!", [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const renderInputField = (field) => (
    <View key={field.key} style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{field.label}</Text>
      <View style={styles.inputRow}>
        <Ionicons
          name={currentType.icon}
          size={20}
          color={Colors.textSecondary}
        />
        <TextInput
          style={styles.textInput}
          placeholder={field.placeholder}
          value={values[field.key] || ""}
          onChangeText={(text) => setValues({ ...values, [field.key]: text })}
          keyboardType="numeric"
          placeholderTextColor={Colors.textSecondary}
        />
        {field.unit && <Text style={styles.unitText}>{field.unit}</Text>}
      </View>
      <View style={styles.inputUnderline} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentType.title}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentType.fields.map(renderInputField)}

        <View style={styles.noteContainer}>
          <Text style={styles.noteLabel}>Note (Optional)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Add a note about this reading..."
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={Colors.textSecondary}
          />
          <Text style={styles.characterCount}>
            {note.length}/500 characters
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Reading</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: Sizes.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  closeButton: {
    padding: Sizes.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.lg,
  },
  inputContainer: {
    marginBottom: Sizes.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.xs,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    marginLeft: Sizes.sm,
    paddingVertical: Sizes.sm,
  },
  unitText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
    marginLeft: Sizes.sm,
  },
  inputUnderline: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  noteContainer: {
    marginTop: Sizes.lg,
  },
  noteLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  noteInput: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: Sizes.md,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: Sizes.xs,
  },
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingVertical: Sizes.md,
    marginRight: Sizes.sm,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: Sizes.md,
    marginLeft: Sizes.sm,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
});

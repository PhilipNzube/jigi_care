import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function SymptomsInputSection({ symptoms, onSymptomsChange }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Describe your symptoms</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Describe..."
        placeholderTextColor="#999"
        value={symptoms}
        onChangeText={onSymptomsChange}
        multiline
        maxLength={500}
      />
      <Text style={styles.characterCount}>
        {symptoms.length}/500 characters
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.xl,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginBottom: Sizes.md,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: Sizes.md,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    minHeight: 100,
    textAlignVertical: "top",
  },
  characterCount: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#999",
    marginTop: Sizes.xs,
    textAlign: "left",
  },
});

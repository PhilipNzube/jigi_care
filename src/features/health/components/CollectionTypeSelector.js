import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function CollectionTypeSelector({
  collectionType,
  onCollectionTypeChange,
  homeCollectionFee,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Collection Type</Text>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.option,
            collectionType === "home" && styles.selectedOption,
          ]}
          onPress={() => onCollectionTypeChange("home")}
        >
          <View style={styles.radioButton}>
            {collectionType === "home" && <View style={styles.radioSelected} />}
          </View>
          <Text style={styles.optionText}>
            Home Collection (+₦{homeCollectionFee.toLocaleString()})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.option,
            collectionType === "lab" && styles.selectedOption,
          ]}
          onPress={() => onCollectionTypeChange("lab")}
        >
          <View style={styles.radioButton}>
            {collectionType === "lab" && <View style={styles.radioSelected} />}
          </View>
          <Text style={styles.optionText}>Visit Lab Centre</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  optionsContainer: {
    gap: Sizes.md,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: Sizes.md,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedOption: {
    borderColor: "#0098B3",
    backgroundColor: "#F0F8FF",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    marginRight: Sizes.md,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0098B3",
  },
  optionText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    flex: 1,
  },
});

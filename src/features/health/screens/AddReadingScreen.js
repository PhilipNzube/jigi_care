import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function AddReadingScreen({ navigation }) {
  const readingTypes = [
    {
      id: "blood_pressure",
      title: "Blood Pressure",
      icon: "heart",
      color: "#FF6B6B",
    },
    {
      id: "heart_rate",
      title: "Heart Rate",
      icon: "pulse",
      color: "#4ECDC4",
    },
    {
      id: "weight",
      title: "Weight",
      icon: "scale",
      color: "#3498DB",
    },
    {
      id: "temperature",
      title: "Temperature",
      icon: "thermometer",
      color: "#9B59B6",
    },
  ];

  const handleReadingTypeSelect = (type) => {
    // Navigate to specific reading input bottom sheet
    if (type === "blood_pressure") {
      navigation.navigate("BloodPressureBottomSheet");
    } else if (type === "temperature") {
      navigation.navigate("TemperatureBottomSheet");
    } else if (type === "weight") {
      navigation.navigate("WeightBottomSheet");
    } else if (type === "heart_rate") {
      navigation.navigate("HeartRateBottomSheet");
    }
  };

  const renderReadingTypeCard = (readingType) => (
    <TouchableOpacity
      key={readingType.id}
      style={styles.readingTypeCard}
      onPress={() => handleReadingTypeSelect(readingType.id)}
    >
      <Ionicons name={readingType.icon} size={32} color={readingType.color} />
      <Text style={styles.readingTypeText}>{readingType.title}</Text>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Add Reading</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Select Reading Type</Text>

        <View style={styles.readingTypesGrid}>
          {readingTypes.map(renderReadingTypeCard)}
        </View>
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
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    backgroundColor: "#F5F5F5",
    position: "relative",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: Sizes.lg,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    marginBottom: Sizes.lg,
  },
  readingTypesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  readingTypeCard: {
    width: "48%",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.lg,
    alignItems: "center",
    marginBottom: Sizes.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  readingTypeText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    marginTop: Sizes.sm,
    textAlign: "center",
  },
});

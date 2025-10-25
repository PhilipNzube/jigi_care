import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

const VitalSignsGrid = ({ onAddReading }) => {
  const vitalSigns = [
    {
      id: "blood_pressure",
      title: "Blood Pressure",
      value: "120/80 mmHg",
      status: "Normal",
      icon: "heart",
      color: "#FF6B6B",
      trend: null,
    },
    {
      id: "heart_rate",
      title: "Heart Rate",
      value: "72 bpm",
      status: "Normal",
      icon: "pulse",
      color: "#4ECDC4",
      trend: "up",
    },
    {
      id: "temperature",
      title: "Temperature",
      value: "96.8 °F",
      status: "Normal",
      icon: "thermometer",
      color: "#9B59B6",
      trend: null,
    },
    {
      id: "weight",
      title: "Weight",
      value: "62.25 kg",
      status: "Normal",
      icon: "scale",
      color: "#3498DB",
      trend: "down",
    },
  ];

  const renderVitalSignCard = (vital) => (
    <TouchableOpacity key={vital.id} style={styles.vitalCard}>
      <View style={styles.vitalHeader}>
        <View style={styles.vitalIconContainer}>
          <Ionicons name={vital.icon} size={24} color={vital.color} />
        </View>
        {vital.trend && (
          <Ionicons
            name={vital.trend === "up" ? "arrow-up" : "arrow-down"}
            size={16}
            color={vital.trend === "up" ? "#E74C3C" : "#27AE60"}
          />
        )}
        {!vital.trend && <Ionicons name="remove" size={16} color="#9E9E9E" />}
      </View>
      <Text style={styles.vitalTitle}>{vital.title}</Text>
      <Text style={styles.vitalValue}>{vital.value}</Text>
      <View style={[styles.statusBadge, { backgroundColor: "#009A4914" }]}>
        <Text style={styles.statusText}>{vital.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vital Signs</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddReading}>
          <Text style={styles.addButtonText}>Add Reading</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.vitalSignsGrid}>
        {vitalSigns.map(renderVitalSignCard)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
  },
  addButton: {
    backgroundColor: "#00BCD4",
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: 20,
  },
  addButtonText: {
    color: Colors.white,
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  vitalSignsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  vitalCard: {
    width: "48%",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.md,
    marginBottom: Sizes.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  vitalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  vitalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  vitalTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#000",
    marginBottom: Sizes.xs,
  },
  vitalValue: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#009A49",
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
});

export default VitalSignsGrid;

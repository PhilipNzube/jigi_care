import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function HealthMonitoringScreen({ navigation }) {
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

  const handleAddReading = () => {
    navigation.navigate("AddReading");
  };

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Monitoring</Text>
      </View>

      <ScrollView
        style={styles.medicationContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vital Signs</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddReading}>
            <Text style={styles.addButtonText}>Add Reading</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.vitalSignsGrid}>
          {vitalSigns.map(renderVitalSignCard)}
        </View>

        {/* Blood Pressure Chart Section */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Blood Pressure</Text>
          <View style={styles.chartCard}>
            <Text style={styles.chartPlaceholder}>
              Chart visualization would go here
            </Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendColor, { backgroundColor: "#4DD0E1" }]}
                />
                <Text style={styles.legendText}>Systolic</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendColor, { backgroundColor: "#EC407A" }]}
                />
                <Text style={styles.legendText}>Diastolic</Text>
              </View>
            </View>
            <Text style={styles.chartTimeframe}>Last 7 days</Text>
          </View>
        </View>

        {/* Today's Medications Section */}
        <View style={styles.medicationsSection}>
          <View style={styles.medicationsHeader}>
            <Text style={styles.medicationsTitle}>Today's Medications</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.medicationCard}>
            <View style={styles.medicationHeader}>
              <Text style={styles.medicationDate}>
                Sep 25th, 2025 • 12:00 PM
              </Text>
            </View>
            <View style={styles.medicationContent}>
              <View style={styles.medicationItem}>
                <View style={styles.medicationImageContainer}>
                  <View style={styles.medicationImage} />
                </View>
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>Acetaminophen</Text>
                  <Text style={styles.medicationDosage}>
                    500mg • Twice daily
                  </Text>
                  <Text style={styles.medicationDescription}>
                    Pain reliever and fever reducer
                  </Text>
                </View>
                <View style={styles.medicationStatus}>
                  <View style={styles.statusRow}>
                    <View style={styles.checkbox}>
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.white}
                      />
                    </View>
                    <Text style={styles.statusText}>Taken</Text>
                  </View>
                  <View
                    style={[styles.statusTag, { backgroundColor: "#FFF3CD" }]}
                  >
                    <Text style={[styles.statusTagText, { color: "#856404" }]}>
                      Running Low
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.medicationCard}>
            <View style={styles.medicationHeader}>
              <Text style={styles.medicationDate}>
                Sep 25th, 2025 • 12:00 PM
              </Text>
            </View>

            <View style={styles.medicationContent}>
              <View style={styles.medicationItem}>
                <View
                  style={[
                    styles.medicationImageContainer,
                    { backgroundColor: "#FFB6C1" },
                  ]}
                >
                  <View style={styles.medicationImage} />
                </View>
                <View style={styles.medicationInfo}>
                  <View style={styles.medicationNameRow}>
                    <Text style={styles.medicationName}>Equate</Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={styles.ratingText}>4.6</Text>
                    </View>
                  </View>
                  <Text style={styles.medicationDosage}>25mg • Once daily</Text>
                  <Text style={styles.medicationDescription}>
                    Antihistamine for allergy symptoms
                  </Text>
                </View>
                <View style={styles.medicationStatus}>
                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: Colors.white,
                          borderWidth: 1,
                          borderColor: "#E0E0E0",
                        },
                      ]}
                    ></View>
                    <Text style={styles.statusText}>Not taken</Text>
                  </View>
                  <View
                    style={[styles.statusTag, { backgroundColor: "#F8D7DA" }]}
                  >
                    <Text style={[styles.statusTagText, { color: "#721C24" }]}>
                      Refill Needed
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Export Health Data Section */}
        <View style={styles.exportSection}>
          <View style={styles.exportCard}>
            <View style={styles.exportInfo}>
              <Text style={styles.exportTitle}>Export Health Data</Text>
              <Text style={styles.exportDescription}>
                Share with your healthcare provider
              </Text>
            </View>
            <TouchableOpacity style={styles.exportButton}>
              <Text style={styles.exportButtonText}>Export PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Sizes.lg,
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
    marginBottom: Sizes.xl,
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
  chartSection: {
    marginBottom: Sizes.xl,
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartPlaceholder: {
    textAlign: "center",
    color: Colors.textSecondary,
    fontStyle: "italic",
    marginBottom: Sizes.md,
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Sizes.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Sizes.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Sizes.xs,
  },
  legendText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
  },
  chartTimeframe: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  // Medications Section Styles
  medicationsSection: {
    marginBottom: Sizes.xl,
  },
  medicationsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  medicationsTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#007AFF",
  },
  medicationCard: {
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
  medicationContent: {
    padding: Sizes.md,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
  },
  medicationHeader: {
    marginBottom: Sizes.sm,
  },
  medicationDate: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  medicationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  medicationImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FF6B6B",
    marginRight: Sizes.md,
    justifyContent: "center",
    alignItems: "center",
  },
  medicationImage: {
    width: 24,
    height: 24,
    backgroundColor: Colors.white,
    borderRadius: 4,
  },
  medicationInfo: {
    flex: 1,
    marginRight: Sizes.sm,
  },
  medicationNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.xs,
  },
  medicationName: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#2E7D32",
    marginRight: Sizes.sm,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  medicationDosage: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  medicationDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  medicationStatus: {
    alignItems: "flex-end",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.xs,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
  },
  statusTag: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTagText: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
  },
  // Export Section Styles
  exportSection: {
    marginBottom: Sizes.xl,
  },
  exportCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  exportInfo: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  exportDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  exportButton: {
    backgroundColor: "#00BCD4",
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: 8,
  },
  exportButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
});

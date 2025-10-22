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
  const [showAddReadingModal, setShowAddReadingModal] = useState(false);
  const [selectedReadingType, setSelectedReadingType] = useState(null);

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
    setShowAddReadingModal(true);
  };

  const handleReadingTypeSelect = (type) => {
    setSelectedReadingType(type);
    setShowAddReadingModal(false);
    // Navigate to specific reading input screen
    navigation.navigate("AddReading", { type });
  };

  const renderVitalSignCard = (vital) => (
    <TouchableOpacity key={vital.id} style={styles.vitalCard}>
      <View style={styles.vitalHeader}>
        <View style={styles.vitalIconContainer}>
          <Ionicons name={vital.icon} size={24} color={vital.color} />
        </View>
        {vital.trend && (
          <Ionicons
            name={vital.trend === "up" ? "trending-up" : "trending-down"}
            size={16}
            color={vital.trend === "up" ? "#E74C3C" : "#27AE60"}
          />
        )}
      </View>
      <Text style={styles.vitalTitle}>{vital.title}</Text>
      <Text style={styles.vitalValue}>{vital.value}</Text>
      <View style={[styles.statusBadge, { backgroundColor: "#27AE60" }]}>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                  style={[styles.legendColor, { backgroundColor: "#4ECDC4" }]}
                />
                <Text style={styles.legendText}>Systolic</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendColor, { backgroundColor: "#FF6B6B" }]}
                />
                <Text style={styles.legendText}>Diastolic</Text>
              </View>
            </View>
            <Text style={styles.chartTimeframe}>Last 7 days</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Reading Modal */}
      <Modal
        visible={showAddReadingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddReadingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Reading</Text>
              <TouchableOpacity
                onPress={() => setShowAddReadingModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Select Reading Type</Text>

            <View style={styles.readingTypesGrid}>
              {vitalSigns.map((vital) => (
                <TouchableOpacity
                  key={vital.id}
                  style={styles.readingTypeCard}
                  onPress={() => handleReadingTypeSelect(vital.id)}
                >
                  <Ionicons name={vital.icon} size={32} color={vital.color} />
                  <Text style={styles.readingTypeText}>{vital.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    marginRight: Sizes.md,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
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
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
  },
  addButton: {
    backgroundColor: Colors.primary,
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
    elevation: 3,
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
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  vitalTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
    marginBottom: Sizes.xs,
  },
  vitalValue: {
    fontSize: 20,
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
    color: Colors.white,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Sizes.lg,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: Sizes.xs,
  },
  modalSubtitle: {
    fontSize: 16,
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
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: Sizes.lg,
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  readingTypeText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    marginTop: Sizes.sm,
    textAlign: "center",
  },
});

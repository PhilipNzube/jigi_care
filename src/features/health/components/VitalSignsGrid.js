import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { getHealthMonitoring } from "../services/healthMonitoringService";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";

const VitalSignsGrid = forwardRef(({ onAddReading }, ref) => {
  const [healthData, setHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHealthData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getHealthMonitoring();
      // Get the most recent record (first one if sorted by date)
      if (data && data.length > 0) {
        setHealthData(data[0]);
      } else {
        setHealthData(null);
      }
    } catch (error) {
      console.error("❌ [VITAL SIGNS GRID] Error fetching health data:", error);
      setHealthData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Expose refresh function to parent via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchHealthData,
  }));

  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  // Map API data to vital signs format
  const getVitalSigns = () => {
    if (!healthData) {
      return [
        {
          id: "blood_pressure",
          title: "Blood Pressure",
          value: "—",
          status: "—",
          icon: "heart",
          color: "#FF6B6B",
          trend: null,
        },
        {
          id: "heart_rate",
          title: "Heart Rate",
          value: "—",
          status: "—",
          icon: "pulse",
          color: "#4ECDC4",
          trend: null,
        },
        {
          id: "temperature",
          title: "Temperature",
          value: "—",
          status: "—",
          icon: "thermometer",
          color: "#9B59B6",
          trend: null,
        },
        {
          id: "weight",
          title: "Weight",
          value: "—",
          status: "—",
          icon: "scale",
          color: "#3498DB",
          trend: null,
        },
      ];
    }

    const vitalSigns = [];

    // Blood Pressure
    if (healthData.bloodPressure) {
      vitalSigns.push({
        id: "blood_pressure",
        title: "Blood Pressure",
        value: `${healthData.bloodPressure.systolic}/${healthData.bloodPressure.diastolic} mmHg`,
        status: healthData.bloodPressure.status || "Normal",
        icon: "heart",
        color: "#FF6B6B",
        trend: null,
      });
    } else {
      vitalSigns.push({
        id: "blood_pressure",
        title: "Blood Pressure",
        value: "—",
        status: "—",
        icon: "heart",
        color: "#FF6B6B",
        trend: null,
      });
    }

    // Heart Rate
    if (healthData.heartRate) {
      vitalSigns.push({
        id: "heart_rate",
        title: "Heart Rate",
        value: `${healthData.heartRate.value} bpm`,
        status: healthData.heartRate.status || "Normal",
        icon: "pulse",
        color: "#4ECDC4",
        trend: null,
      });
    } else {
      vitalSigns.push({
        id: "heart_rate",
        title: "Heart Rate",
        value: "—",
        status: "—",
        icon: "pulse",
        color: "#4ECDC4",
        trend: null,
      });
    }

    // Temperature
    if (healthData.temperature) {
      vitalSigns.push({
        id: "temperature",
        title: "Temperature",
        value: `${healthData.temperature.value} °F`,
        status: healthData.temperature.status || "Normal",
        icon: "thermometer",
        color: "#9B59B6",
        trend: null,
      });
    } else {
      vitalSigns.push({
        id: "temperature",
        title: "Temperature",
        value: "—",
        status: "—",
        icon: "thermometer",
        color: "#9B59B6",
        trend: null,
      });
    }

    // Weight
    if (healthData.weight) {
      vitalSigns.push({
        id: "weight",
        title: "Weight",
        value: `${healthData.weight.value} kg`,
        status: healthData.weight.status || "Normal",
        icon: "scale",
        color: "#3498DB",
        trend: null,
      });
    } else {
      vitalSigns.push({
        id: "weight",
        title: "Weight",
        value: "—",
        status: "—",
        icon: "scale",
        color: "#3498DB",
        trend: null,
      });
    }

    return vitalSigns;
  };

  const vitalSigns = getVitalSigns();

  const renderVitalSignCard = (vital) => (
    <View
      key={vital.id}
      style={styles.vitalCard}
    >
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
      {vital.status !== "—" && (
        <View style={[styles.statusBadge, { backgroundColor: "#009A4914" }]}>
          <Text style={styles.statusText}>{vital.status}</Text>
        </View>
      )}
    </View>
  );

  const renderSkeleton = () => (
    <ShimmerLoader>
      <View style={styles.vitalSignsGrid}>
        {[1, 2, 3, 4].map((index) => (
          <View key={index} style={styles.vitalCard}>
            <View style={styles.vitalHeader}>
              <View style={styles.vitalIconContainer}>
                <View style={{ width: 24, height: 24, borderRadius: 12 }} />
              </View>
              <View style={{ width: 16, height: 16, borderRadius: 8 }} />
            </View>
            <View style={{ width: 100, height: 14, borderRadius: 4, marginBottom: Sizes.xs }} />
            <View style={{ width: 80, height: 16, borderRadius: 4, marginBottom: Sizes.sm }} />
            <View style={{ width: 60, height: 20, borderRadius: 12 }} />
          </View>
        ))}
      </View>
    </ShimmerLoader>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vital Signs</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddReading}>
          <Text style={styles.addButtonText}>Add Reading</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        renderSkeleton()
      ) : (
        <View style={styles.vitalSignsGrid}>
          {vitalSigns.map(renderVitalSignCard)}
        </View>
      )}
    </View>
  );
});

VitalSignsGrid.displayName = "VitalSignsGrid";

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

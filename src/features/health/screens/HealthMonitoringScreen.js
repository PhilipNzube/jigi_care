import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import VitalSignsGrid from "../components/VitalSignsGrid";
import BloodPressureChart from "../components/BloodPressureChart";
import MedicationsSection from "../components/MedicationsSection";
import ExportHealthDataSection from "../components/ExportHealthDataSection";

export default function HealthMonitoringScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const vitalSignsGridRef = useRef(null);
  const bloodPressureChartRef = useRef(null);

  const handleAddReading = () => {
    navigation.navigate("AddReading");
  };

  const refreshVitalSigns = useCallback(async () => {
    try {
      // Trigger refresh in VitalSignsGrid
      if (vitalSignsGridRef.current?.refresh) {
        await vitalSignsGridRef.current.refresh();
      }
    } catch (error) {
      console.error("❌ [HEALTH MONITORING] Error refreshing:", error);
    }
  }, []);

  const refreshBloodPressureChart = useCallback(async () => {
    try {
      // Trigger refresh in BloodPressureChart
      if (bloodPressureChartRef.current?.refresh) {
        await bloodPressureChartRef.current.refresh();
      }
    } catch (error) {
      console.error("❌ [HEALTH MONITORING] Error refreshing chart:", error);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshVitalSigns(),
      refreshBloodPressureChart(),
    ]);
    setRefreshing(false);
  };

  // Refresh vital signs and chart when screen comes into focus (e.g., returning from AddReading)
  useFocusEffect(
    useCallback(() => {
      refreshVitalSigns();
      refreshBloodPressureChart();
    }, [refreshVitalSigns, refreshBloodPressureChart])
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
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <VitalSignsGrid ref={vitalSignsGridRef} onAddReading={handleAddReading} />
        <BloodPressureChart ref={bloodPressureChartRef} />
        <MedicationsSection navigation={navigation} />
        <ExportHealthDataSection />
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
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function TestResultDetailsScreen({ navigation, route }) {
  const { result } = route.params || {};

  const defaultResult = {
    testName: "Complete Blood Count (CBC)",
    doctor: "Dr. Sarah Olukoya",
    lab: "MedLab Diagnosis",
    date: "Sep 25th, 2025 • 10:05 AM",
    status: "Normal",
    statusColor: "#27AE60",
    testValues: [
      {
        parameter: "Hemoglobin",
        value: "14.2 g/dL",
        range: "12.0-15.5",
        status: "Normal",
        statusColor: "#27AE60",
      },
      {
        parameter: "Hematocrit",
        value: "42.0 %",
        range: "37.0-47.0",
        status: "Normal",
        statusColor: "#27AE60",
      },
      {
        parameter: "White Blood Cells",
        value: "6.5 K/uL",
        range: "4.0-11.0",
        status: "Normal",
        statusColor: "#27AE60",
      },
      {
        parameter: "Platelets",
        value: "250 K/uL",
        range: "150-450",
        status: "Normal",
        statusColor: "#27AE60",
      },
    ],
  };

  const currentResult = result || defaultResult;

  const handleDownloadReport = () => {
    console.log("Download report:", currentResult);
    // Implement download functionality
  };

  const handleConsultDoctor = () => {
    navigation.navigate("ConsultScreen");
  };

  const renderTestValue = (testValue) => (
    <View key={testValue.parameter} style={styles.testValueCard}>
      <View style={styles.testValueHeader}>
        <Text style={styles.testValueParameter}>{testValue.parameter}</Text>
        <View
          style={[
            styles.testValueStatus,
            { backgroundColor: testValue.statusColor },
          ]}
        >
          <Text style={styles.testValueStatusText}>{testValue.status}</Text>
        </View>
      </View>
      <View style={styles.testValueDetails}>
        <Text style={styles.testValueValue}>{testValue.value}</Text>
        <Text style={styles.testValueRange}>Range: {testValue.range}</Text>
      </View>
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
        <Text style={styles.headerTitle}>TEST RESULT</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Test Information */}
        <View style={styles.testInfoCard}>
          <Text style={styles.testDate}>{currentResult.date}</Text>
          <Text style={styles.testDoctor}>Doctor: {currentResult.doctor}</Text>
          <Text style={styles.testLab}>Lab: {currentResult.lab}</Text>
        </View>

        {/* Test Values Section */}
        <View style={styles.testValuesSection}>
          <Text style={styles.sectionTitle}>Test Values</Text>
          {currentResult.testValues.map(renderTestValue)}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownloadReport}
        >
          <Text style={styles.downloadButtonText}>Download Report</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.consultButton}
          onPress={handleConsultDoctor}
        >
          <Text style={styles.consultButtonText}>Consult Doctor</Text>
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
  },
  closeButton: {
    padding: Sizes.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
  },
  testInfoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.lg,
    marginTop: Sizes.lg,
    marginBottom: Sizes.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testDate: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
  },
  testDoctor: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  testLab: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
  },
  testValuesSection: {
    marginBottom: Sizes.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.lg,
  },
  testValueCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.lg,
    marginBottom: Sizes.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testValueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  testValueParameter: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
  },
  testValueStatus: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    borderRadius: 12,
  },
  testValueStatusText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
  testValueDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  testValueValue: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
  },
  testValueRange: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  downloadButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: Sizes.md,
    marginRight: Sizes.sm,
    alignItems: "center",
  },
  downloadButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
  },
  consultButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: Sizes.md,
    marginLeft: Sizes.sm,
    alignItems: "center",
  },
  consultButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
});

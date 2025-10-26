import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function TestResultBottomSheet({ visible, onClose, result }) {
  const insets = useSafeAreaInsets();
  const defaultResult = {
    id: 1,
    testName: "Complete Blood Count",
    doctor: "Dr. Sarah Olukoya",
    date: "Sep 25th, 2025 • 10:05 AM",
    status: "Normal",
    statusColor: "#27AE60",
    lab: "MedLab Diagnosis",
  };

  const currentResult = result || defaultResult;

  // Sample test parameters and results
  const testParameters = [
    {
      name: "Hemoglobin",
      value: "14.2",
      unit: "g/dL",
      normal: "12.0-15.5",
      status: "normal",
    },
    {
      name: "Hematocrit",
      value: "42.0",
      unit: "%",
      normal: "37.0-47.0",
      status: "normal",
    },
    {
      name: "White Blood Cells",
      value: "6.5",
      unit: "K/uL",
      normal: "4.0-11.0",
      status: "normal",
    },
    {
      name: "Platelets",
      value: "250",
      unit: "K/uL",
      normal: "150-450",
      status: "normal",
    },
  ];

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  const handleDownloadReport = () => {
    console.log("Downloading report for:", currentResult.testName);
    // Implement download functionality
  };

  const handleConsultDoctor = () => {
    console.log("Consulting doctor for:", currentResult.testName);
    // Implement consult doctor functionality
  };

  const renderTestParameter = (param) => (
    <View key={param.name} style={styles.parameterCard}>
      <View style={styles.parameterHeader}>
        <Text style={styles.parameterName}>{param.name}</Text>
        <View
          style={[
            styles.statusTag,
            {
              backgroundColor:
                param.status === "normal" ? "#27AE6020" : "#E74C3C20",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: param.status === "normal" ? "#27AE60" : "#E74C3C" },
            ]}
          >
            {param.status === "normal" ? "Normal" : "Attention"}
          </Text>
        </View>
      </View>
      <View style={styles.parameterValue}>
        <Text style={styles.valueNumber}>{param.value}</Text>
        <Text style={styles.valueUnit}>{param.unit}</Text>
      </View>
      <Text style={styles.parameterRange}>Range: {param.normal}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.bottomSheet}>
          <View style={[styles.header, { paddingTop: insets.top + Sizes.md }]}>
            <Text style={styles.headerTitle}>TEST RESULT</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Test Info */}
            <View style={styles.testInfoSection}>
              <View style={styles.testHeader}>
                <Text style={styles.testName}>{currentResult.testName}</Text>
                <View
                  style={[
                    styles.statusTag,
                    { backgroundColor: currentResult.statusColor + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: currentResult.statusColor },
                    ]}
                  >
                    {currentResult.status}
                  </Text>
                </View>
              </View>

              <View style={styles.testDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>{currentResult.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Doctor:</Text>
                  <Text style={styles.detailValue}>{currentResult.doctor}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Lab:</Text>
                  <Text style={styles.detailValue}>{currentResult.lab}</Text>
                </View>
              </View>
            </View>

            {/* Test Values */}
            <View style={styles.testValuesSection}>
              <Text style={styles.sectionTitle}>Test Values</Text>
              {testParameters.map(renderTestParameter)}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View
            style={[
              styles.actionButtons,
              { paddingBottom: insets.bottom + Sizes.md },
            ]}
          >
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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    minHeight: "60%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
  },
  testInfoSection: {
    paddingVertical: Sizes.lg,
  },
  testHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  testName: {
    fontSize: 20,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    flex: 1,
  },
  statusTag: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
  testDetails: {
    gap: Sizes.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
  },
  testValuesSection: {
    paddingBottom: Sizes.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  parameterCard: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: Sizes.md,
    marginBottom: Sizes.sm,
  },
  parameterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  parameterName: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
  },
  parameterValue: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: Sizes.xs,
  },
  valueNumber: {
    fontSize: 24,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
  },
  valueUnit: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    marginLeft: Sizes.xs,
  },
  parameterRange: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Sizes.sm,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  downloadButton: {
    flex: 1,
    backgroundColor: "#0098B3",
    borderRadius: 12,
    paddingVertical: Sizes.md,
    alignItems: "center",
  },
  downloadButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
  consultButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#0098B3",
    borderRadius: 12,
    paddingVertical: Sizes.md,
    alignItems: "center",
  },
  consultButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#0098B3",
  },
});

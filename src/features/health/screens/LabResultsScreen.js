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

export default function LabResultsScreen({ navigation }) {
  const summaryData = {
    totalTests: 4,
    normal: 3,
    attention: 1,
  };

  const results = [
    {
      id: 1,
      testName: "Complete Blood Count",
      doctor: "Dr. Sarah Olukoya",
      date: "Sep 25th, 2025 • 12:00 PM",
      status: "Normal",
      statusColor: "#27AE60",
    },
    {
      id: 2,
      testName: "Lipid Profile",
      doctor: "Dr. Femi Johnson",
      date: "Sep 25th, 2025 • 12:00 PM",
      status: "Attention Required",
      statusColor: "#E74C3C",
    },
  ];

  const handleViewDetails = (result) => {
    navigation.navigate("TestResultDetails", { result });
  };

  const handleDownload = (result) => {
    console.log("Download result:", result);
    // Implement download functionality
  };

  const renderSummaryCard = (title, value, color) => (
    <View key={title} style={styles.summaryCard}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{title}</Text>
    </View>
  );

  const renderResultCard = (result) => (
    <View key={result.id} style={styles.resultCard}>
      <Text style={styles.resultDate}>{result.date}</Text>
      <View style={styles.resultContent}>
        <View style={styles.resultInfo}>
          <Text style={styles.resultTestName}>{result.testName}</Text>
          <Text style={styles.resultDoctor}>{result.doctor}</Text>
        </View>
        <View
          style={[styles.resultStatus, { backgroundColor: result.statusColor }]}
        >
          <Text style={styles.resultStatusText}>{result.status}</Text>
        </View>
      </View>
      <View style={styles.resultActions}>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => handleDownload(result)}
        >
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => handleViewDetails(result)}
        >
          <Text style={styles.viewDetailsButtonText}>View Details</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Lab Results</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          {renderSummaryCard("Total Test", summaryData.totalTests, "#3498DB")}
          {renderSummaryCard("Normal", summaryData.normal, "#27AE60")}
          {renderSummaryCard("Attention", summaryData.attention, "#E74C3C")}
        </View>

        {/* Results List */}
        <View style={styles.resultsSection}>
          {results.map(renderResultCard)}
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
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Sizes.lg,
    marginBottom: Sizes.xl,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.lg,
    alignItems: "center",
    marginHorizontal: Sizes.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    marginBottom: Sizes.xs,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
  },
  resultsSection: {
    marginBottom: Sizes.xl,
  },
  resultCard: {
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
  resultDate: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
  },
  resultContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  resultInfo: {
    flex: 1,
  },
  resultTestName: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  resultDoctor: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  resultStatus: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    borderRadius: 12,
  },
  resultStatusText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
  resultActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  downloadButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: Sizes.sm,
    marginRight: Sizes.sm,
    alignItems: "center",
  },
  downloadButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
  },
  viewDetailsButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: Sizes.sm,
    marginLeft: Sizes.sm,
    alignItems: "center",
  },
  viewDetailsButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
});

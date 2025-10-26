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
import SummaryCards from "../components/SummaryCards";
import LabResultCard from "../components/LabResultCard";

export default function LabResultsScreen({ navigation }) {
  const summaryData = {
    totalTests: 4,
    normalResults: 3,
    attentionRequired: 1,
  };

  const labResults = [
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
    {
      id: 3,
      testName: "Liver Function Test",
      doctor: "Dr. Ada Okonkwo",
      date: "Sep 24th, 2025 • 10:30 AM",
      status: "Normal",
      statusColor: "#27AE60",
    },
    {
      id: 4,
      testName: "Thyroid Function Test",
      doctor: "Dr. Michael Adebayo",
      date: "Sep 23rd, 2025 • 2:15 PM",
      status: "Normal",
      statusColor: "#27AE60",
    },
  ];

  const handleDownload = (result) => {
    console.log("Downloading result:", result.testName);
    // Implement download functionality
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lab Results</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SummaryCards summaryData={summaryData} />

        <View style={styles.resultsContainer}>
          {labResults.map((result) => (
            <LabResultCard
              key={result.id}
              result={result}
              onDownload={() => handleDownload(result)}
            />
          ))}
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
  resultsContainer: {
    marginTop: Sizes.lg,
    gap: Sizes.md,
  },
});

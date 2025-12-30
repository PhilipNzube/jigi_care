import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { format, parseISO } from "date-fns";
import { getTestResults } from "../services/labTestService";
import SummaryCards from "../components/SummaryCards";
import LabResultCard from "../components/LabResultCard";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";

export default function LabResultsScreen({ navigation }) {
  const [labResults, setLabResults] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalTests: 0,
    normalResults: 0,
    attentionRequired: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }
      const response = await getTestResults();
      const resultsData = response.data || [];
      
      // Map API data to component format
      const mappedResults = resultsData.map((result) => {
        const date = result.date ? parseISO(result.date) : new Date();
        const formattedDate = format(date, "MMM dd, yyyy • h:mm a");
        
        // Determine status color based on status
        const statusColor = result.status === "normal" ? "#27AE60" : "#E74C3C";
        const statusText = result.status === "normal" ? "Normal" : "Attention Required";
        
        return {
          id: result.id || Math.random().toString(),
          testName: result.title,
          doctor: result.doctor || "Dr. Unknown",
          lab: result.lab || "Unknown Lab",
          date: formattedDate,
          status: statusText,
          statusColor: statusColor,
          resultData: result, // Keep original data for bottom sheet
        };
      });
      
      setLabResults(mappedResults);
      
      // Calculate summary
      const totalTests = mappedResults.length;
      const normalResults = mappedResults.filter(r => r.status === "Normal").length;
      const attentionRequired = totalTests - normalResults;
      
      setSummaryData({
        totalTests,
        normalResults,
        attentionRequired,
      });
    } catch (error) {
      console.error("❌ [LAB RESULTS] Error fetching results:", error);
      setLabResults([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchResults(true);
  }, []);

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

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isLoading ? (
          <>
            <ShimmerLoader>
              <View style={{ flexDirection: "row", gap: Sizes.sm, marginBottom: Sizes.lg }}>
                <View style={{ flex: 1, height: 100, borderRadius: 12 }} />
                <View style={{ flex: 1, height: 100, borderRadius: 12 }} />
                <View style={{ flex: 1, height: 100, borderRadius: 12 }} />
              </View>
            </ShimmerLoader>
            {[1, 2, 3].map((i) => (
              <ShimmerLoader key={i}>
                <View style={{ height: 150, borderRadius: 12, marginBottom: Sizes.md }} />
              </ShimmerLoader>
            ))}
          </>
        ) : (
          <>
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
          </>
        )}
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

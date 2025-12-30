import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import { getTestResults } from "../services/labTestService";
import { format, parseISO } from "date-fns";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";

export default function RecentResultsSection({
  onViewAll,
  onViewResult,
}) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      const response = await getTestResults();
      const resultsData = response.data || [];
      
      // Map API data to component format
      const mappedResults = resultsData.slice(0, 2).map((result) => {
        const date = result.date ? parseISO(result.date) : new Date();
        const formattedDate = format(date, "MMM dd, yyyy • h:mm a");
        
        // Determine status color based on status
        const statusColor = result.status === "normal" ? "#27AE60" : "#E74C3C";
        const statusText = result.status === "normal" ? "Normal" : "Attention Required";
        
        return {
          id: result.id || Math.random().toString(),
          testName: result.title,
          doctor: result.doctor || "Dr. Unknown",
          date: formattedDate,
          status: statusText,
          statusColor: statusColor,
          resultData: result, // Keep original data
        };
      });
      
      setResults(mappedResults);
    } catch (error) {
      console.error("❌ [RECENT RESULTS] Error fetching results:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  const renderResultCard = (result) => (
    <View key={result.id} style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <View style={styles.resultInfo}>
          <Text style={styles.resultDate}>{result.date}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.resultContent}>
          <View style={styles.resultDetails}>
            <View style={styles.resultNameRow}>
              <Text style={styles.testName}>{result.testName}</Text>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusTag,
                    { backgroundColor: result.statusColor + "20" },
                  ]}
                >
                  <Text
                    style={[styles.statusText, { color: result.statusColor }]}
                  >
                    {result.status}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.doctorName}>{result.doctor}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewResultButton}
          onPress={() => onViewResult(result)}
        >
          <Text style={styles.viewResultButtonText}>View Result</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSkeleton = () => (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <ShimmerLoader>
          <View style={{ width: 120, height: 20, borderRadius: 4 }} />
        </ShimmerLoader>
        <ShimmerLoader>
          <View style={{ width: 60, height: 16, borderRadius: 4 }} />
        </ShimmerLoader>
      </View>
      {[1, 2].map((i) => (
        <ShimmerLoader key={i}>
          <View style={styles.resultCard}>
            <View style={{ width: "100%", height: 100, borderRadius: 12 }} />
          </View>
        </ShimmerLoader>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Results</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        renderSkeleton()
      ) : (
        <View style={styles.resultsContainer}>
          {results.map(renderResultCard)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Sizes.lg,
    marginBottom: Sizes.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#0098B3",
  },
  resultsContainer: {
    gap: Sizes.md,
  },
  resultCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.sm,
    marginBottom: Sizes.md,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  content: {
    padding: Sizes.md,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
  },
  resultHeader: {
    marginBottom: Sizes.xs,
  },
  resultInfo: {
    flex: 1,
  },
  resultDate: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#5B6B62",
  },
  resultContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  resultImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
  },
  resultImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#0098B3",
  },
  resultDetails: {
    flex: 1,
  },
  resultNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.xs,
  },
  testName: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    flex: 1,
  },
  doctorName: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#5B6B62",
  },
  statusContainer: {
    alignItems: "flex-end",
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
  viewResultButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#0098B3",
    borderRadius: 25,
    paddingVertical: Sizes.sm,
    alignItems: "center",
  },
  viewResultButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#0098B3",
  },
});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function RecentResultsSection({
  results,
  onViewAll,
  onViewResult,
}) {
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

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Results</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        {results.map(renderResultCard)}
      </View>
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

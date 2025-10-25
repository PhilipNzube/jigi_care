import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function RecentResultsSection({ results, onViewAll }) {
  const renderResultCard = (result) => (
    <View key={result.id} style={styles.resultCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.resultDate}>{result.date}</Text>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.resultItem}>
          <View style={styles.resultImageContainer}>
            <View style={styles.resultImage} />
          </View>
          <View style={styles.resultInfo}>
            <Text style={styles.testName}>{result.testName}</Text>
            <Text style={styles.doctorName}>{result.doctor}</Text>
          </View>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusTag,
                { backgroundColor: result.statusColor + "20" },
              ]}
            >
              <Text style={[styles.statusText, { color: result.statusColor }]}>
                {result.status}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.viewResultButton}>
        <Text style={styles.viewResultButtonText}>View Result</Text>
      </TouchableOpacity>
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
    padding: Sizes.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: Sizes.md,
  },
  cardHeader: {
    marginBottom: Sizes.sm,
  },
  resultDate: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  cardContent: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: Sizes.md,
    marginBottom: Sizes.md,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
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
  resultInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  doctorName: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
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
    borderRadius: 8,
    paddingVertical: Sizes.sm,
    alignItems: "center",
  },
  viewResultButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#0098B3",
  },
});

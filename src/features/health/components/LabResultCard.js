import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import TestResultBottomSheet from "./TestResultBottomSheet";

export default function LabResultCard({ result, onViewDetails, onDownload }) {
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const handleViewDetails = () => {
    setShowBottomSheet(true);
  };

  const handleCloseBottomSheet = () => {
    setShowBottomSheet(false);
  };

  return (
    <>
      <View style={styles.resultCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.resultDate}>{result.date}</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.resultNameRow}>
            <Text style={styles.testName}>{result.testName}</Text>
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
          <Text style={styles.doctorName}>{result.doctor}</Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={onDownload}
            >
              <Text style={styles.downloadButtonText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={handleViewDetails}
            >
              <Text style={styles.viewDetailsButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TestResultBottomSheet
        visible={showBottomSheet}
        onClose={handleCloseBottomSheet}
        result={result}
      />
    </>
  );
}

const styles = StyleSheet.create({
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
  cardHeader: {
    marginBottom: Sizes.sm,
  },
  resultDate: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#5B6B62",
  },
  cardContent: {
    padding: Sizes.md,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
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
  statusTag: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
  actionButtons: {
    flexDirection: "row",
    gap: Sizes.sm,
    marginTop: Sizes.md,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 25,
    paddingVertical: Sizes.sm,
    alignItems: "center",
  },
  downloadButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#0098B3",
  },
  viewDetailsButton: {
    flex: 1,
    backgroundColor: "#0098B3",
    borderRadius: 25,
    paddingVertical: Sizes.sm,
    alignItems: "center",
  },
  viewDetailsButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

export default function PrescriptionCard({ prescription }) {
  // Calculate progress: remainingPills / totalPills
  const pillsRemaining = prescription.pillsRemaining || 0;
  const totalPills = prescription.totalPills || 1;
  const progressPercentage =
    totalPills > 0
      ? Math.min(100, Math.max(0, (pillsRemaining / totalPills) * 100))
      : 0;

  const getStatusTextColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "#0098B3"; // Light blue
      case "running low":
        return "#FF8C00"; // Orange
      case "refill needed":
        return "#E74C3C"; // Red
      default:
        return Colors.grey;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton}>
        <Ionicons name="ellipsis-horizontal" size={20} color="#EBEBEB" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.medicationInfo}>
          <Image source={Images.placeholder} style={styles.medicationImage} />

          <View style={styles.medicationDetails}>
            <View style={styles.nameAndStatus}>
              <Text style={styles.medicationName}>{prescription.name}</Text>
              <View
                style={[
                  styles.statusTag,
                  { backgroundColor: prescription.statusColor },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusTextColor(prescription.status) },
                  ]}
                >
                  {prescription.status}
                </Text>
              </View>
            </View>

            {(() => {
              const dosageText = prescription.dosage || "";
              const parts = dosageText.split(" · ");

              if (parts.length === 2) {
                // Render with bold middle dot
                return (
                  <Text style={styles.dosage}>
                    {parts[0]}
                    <Text style={styles.dosageDot}> · </Text>
                    {parts[1]}
                  </Text>
                );
              }
              // Fallback for text without middle dot
              return <Text style={styles.dosage}>{dosageText}</Text>;
            })()}
            <Text style={styles.doctor}>
              Prescribed by {prescription.doctor}
            </Text>
          </View>
        </View>

        <View style={styles.pillsInfo}>
          <View style={styles.pillsRemaining}>
            <Text style={styles.pillsLabel}>Pills remaining</Text>
            <Text style={styles.pillsCount}>
              {prescription.pillsRemaining}/{prescription.totalPills}
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` },
                ]}
              />
              <View
                style={[
                  styles.progressHandle,
                  { left: `${progressPercentage}%` },
                ]}
              />
            </View>
          </View>

          <Text style={styles.refillDate}>{prescription.refillDate}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  menuButton: {
    marginLeft: Sizes.sm,
  },
  content: {
    padding: Sizes.md,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
  },
  medicationInfo: {
    flexDirection: "row",
    marginBottom: Sizes.md,
  },
  medicationImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Sizes.sm,
  },
  medicationDetails: {
    flex: 1,
  },
  nameAndStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.xs,
  },
  medicationName: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    flex: 1,
  },
  statusTag: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
  dosage: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#5B6B62",
    marginBottom: 2,
  },
  dosageDot: {
    fontFamily: "Poppins-Bold",
    fontWeight: "bold",
  },
  doctor: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#5B6B62",
  },
  pillsInfo: {
    marginTop: Sizes.sm,
  },
  pillsRemaining: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Sizes.xs,
  },
  pillsLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
  },
  pillsCount: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#5B6B62",
  },
  progressBar: {
    marginBottom: Sizes.xs,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    position: "relative",
  },
  progressFill: {
    height: 6,
    backgroundColor: "#E91E63",
    borderRadius: 3,
  },
  progressHandle: {
    position: "absolute",
    top: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E91E63",
  },
  refillDate: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#5B6B62",
  },
});

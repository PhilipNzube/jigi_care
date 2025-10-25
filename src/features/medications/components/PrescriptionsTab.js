import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import PrescriptionCard from "./PrescriptionCard";

export default function PrescriptionsTab() {
  const prescriptions = [
    {
      id: 1,
      name: "Lisinopril",
      dosage: "10mg • Once daily",
      doctor: "Dr. Sarah Olukoya",
      status: "Active",
      statusColor: "#4CAF50",
      pillsRemaining: 20,
      totalPills: 30,
      refillDate: "Oct 18th, 2025",
      image: "medication1",
    },
    {
      id: 2,
      name: "Metformin",
      dosage: "500mg • Twice daily",
      doctor: "Dr. John Smith",
      status: "Running Low",
      statusColor: "#FF9800",
      pillsRemaining: 25,
      totalPills: 60,
      refillDate: "Sep 12th, 2025",
      image: "medication2",
    },
    {
      id: 3,
      name: "Atorvastatin",
      dosage: "20mg • Once daily",
      doctor: "Dr. Emily Chen",
      status: "Refill Needed",
      statusColor: "#F44336",
      pillsRemaining: 0,
      totalPills: 30,
      refillDate: "No refills available",
      image: "medication3",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Current Prescriptions</Text>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {prescriptions.map((prescription) => (
          <PrescriptionCard key={prescription.id} prescription={prescription} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: Sizes.md,
  },
  scrollView: {
    flex: 1,
  },
});




import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import DoctorCard from "./DoctorCard";

export default function AvailableDoctorsSection({ 
  doctors = [], 
  isLoading = false,
  onDoctorPress, 
  navigation 
}) {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Doctors</Text>
        {isLoading && (
          <ActivityIndicator size="small" color={Colors.primary} style={styles.loader} />
        )}
      </View>

      <View style={styles.doctorsList}>
        {isLoading && doctors.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Searching for doctors...</Text>
          </View>
        ) : doctors.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {isLoading ? "Searching..." : "No doctors found. Try a different search."}
            </Text>
          </View>
        ) : (
          doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onPress={() => onDoctorPress(doctor)}
              navigation={navigation}
            />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Sizes.lg,
    backgroundColor: Colors.white,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: Sizes.lg,
    marginBottom: Sizes.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
  },
  loader: {
    marginLeft: Sizes.sm,
  },
  emptyState: {
    paddingVertical: Sizes.xl,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    textAlign: "center",
  },
  doctorsList: {
    paddingHorizontal: Sizes.lg,
    gap: Sizes.md,
  },
});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Sizes } from "../../../shared/constants";
import DoctorCard from "./DoctorCard";

export default function AvailableDoctorsSection({
  onDoctorPress,
  onViewAllPress,
}) {
  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Olukoya",
      specialty: "Neurologist",
      rating: 4.8,
      experience: "7+ years experience",
      languages: "English",
      price: "₦4,000/session",
      isAvailable: true,
      image: null, // Will use placeholder
    },
    {
      id: 2,
      name: "Dr. Ibrahim Bello",
      specialty: "Cardiologist",
      rating: 4.7,
      experience: "8+ years experience",
      languages: "English, Arabic",
      price: "₦6,000/session",
      isAvailable: true,
      image: null, // Will use placeholder
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Doctors</Text>
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.doctorsList}>
        {doctors.map((doctor) => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            onPress={() => onDoctorPress(doctor)}
          />
        ))}
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
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#0098B3",
  },
  doctorsList: {
    paddingHorizontal: Sizes.lg,
    gap: Sizes.md,
  },
});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import DoctorCard from "./DoctorCard";

export default function AvailableDoctorsSection({ onDoctorPress, navigation }) {
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
      </View>

      <View style={styles.doctorsList}>
        {doctors.map((doctor) => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            onPress={() => onDoctorPress(doctor)}
            navigation={navigation}
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
    marginHorizontal: Sizes.lg,
    marginBottom: Sizes.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
  },
  doctorsList: {
    paddingHorizontal: Sizes.lg,
    gap: Sizes.md,
  },
});

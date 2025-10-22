import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function UpcomingAppointmentsList({ navigation }) {
  const upcomingAppointments = [
    {
      id: 1,
      date: "Sep 23rd, 2025",
      time: "12:00 PM",
      doctor: {
        name: "Dr. Sarah Olukoya",
        specialty: "Neurologist",
        rating: 4.8,
      },
    },
    {
      id: 2,
      date: "Sep 25th, 2025",
      time: "12:00 PM",
      doctor: {
        name: "Dr. Hadiza Musa",
        specialty: "Pediatrician",
        rating: 4.8,
      },
      hasChatButton: true,
    },
  ];

  return (
    <View style={styles.appointmentsSection}>
      <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
      <View style={styles.appointmentsContainer}>
        {upcomingAppointments.map((appointment) => (
          <TouchableOpacity
            key={appointment.id}
            style={styles.appointmentCard}
            onPress={() =>
              navigation.navigate("ChatPage", { doctor: appointment.doctor })
            }
          >
            <Text style={styles.appointmentDateTime}>
              {appointment.date} • {appointment.time}
            </Text>
            <View style={styles.doctorInfo}>
              <View style={styles.doctorProfileImageContainer}>
                <Ionicons name="person" size={25} color={Colors.primary} />
              </View>
              <View style={styles.doctorDetails}>
                <Text style={styles.doctorName}>{appointment.doctor.name}</Text>
                <Text style={styles.doctorSpecialty}>
                  {appointment.doctor.specialty}
                </Text>
              </View>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {appointment.doctor.rating}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appointmentsSection: {
    paddingHorizontal: Sizes.lg,
    marginBottom: Sizes.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    marginBottom: Sizes.lg,
  },
  appointmentsContainer: {
    paddingHorizontal: Sizes.sm,
  },
  appointmentCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingTop: Sizes.lg,
    paddingHorizontal: Sizes.sm,
    marginBottom: Sizes.md,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  appointmentDateTime: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
    paddingHorizontal: Sizes.lg,
  },
  doctorInfo: {
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.sm,
    padding: Sizes.md,
  },
  doctorProfileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  chatButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Sizes.sm,
    paddingHorizontal: Sizes.md,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  chatButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
    marginLeft: Sizes.xs,
  },
});

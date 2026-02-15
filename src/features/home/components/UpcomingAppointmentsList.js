import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { getUpcomingAppointments } from "../../consult/services/bookingService";
import { format, parseISO } from "date-fns";
import DoctorCardSkeleton from "../../consult/components/DoctorCardSkeleton";
import ConnectingModal from "./ConnectingModal";

export default function UpcomingAppointmentsList({ navigation, refreshKey }) {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConnectingModal, setShowConnectingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Refresh when refreshKey changes (from parent pull-to-refresh)
  useEffect(() => {
    if (refreshKey > 0) {
      fetchAppointments(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const fetchAppointments = React.useCallback(async (silent = false) => {
    try {
      // Only show loading if this is not a silent refresh
      if (!silent) {
        setIsLoading(true);
      }
      
      const result = await getUpcomingAppointments();
      
      // Home shows only upcoming; API returns new shape with status
      const list = (result.data || []).filter((a) => a.status === "upcoming");
      const mappedAppointments = list.map((appointment, index) => {
        const appointmentDate = parseISO(appointment.date);
        return {
          id: appointment.bookingId || appointment.id || `appointment-${index}-${appointment.date}`,
          date: format(appointmentDate, "MMM d, yyyy"),
          time: format(appointmentDate, "h:mm a"),
          doctor: {
            name: appointment.fullName || "Dr. Unknown",
            specialty: appointment.speciality || "General Practitioner",
            rating: appointment.rating != null ? parseFloat(appointment.rating) : null,
            consultantId: appointment.consultantId,
            bookingId: appointment.bookingId,
          },
          appointmentData: appointment,
          bookingId: appointment.bookingId,
          status: appointment.status,
        };
      });

      setAppointments(mappedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      // Only clear appointments if this is not a silent refresh
      if (!silent) {
        setAppointments([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty deps - we check appointments.length inside

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleAppointmentPress = (appointment) => {
    // Show connecting modal with doctor name
    setSelectedDoctor(appointment.doctor);
    setShowConnectingModal(true);

    // After 3 seconds, hide connecting modal and navigate to ChatPage
    setTimeout(() => {
      setShowConnectingModal(false);
      navigation.navigate("ChatPage", {
        doctor: appointment.doctor,
        bookingId: appointment.bookingId,
        appointmentData: appointment.appointmentData || { status: appointment.status },
        bookingStatus: appointment.status,
      });
    }, 3000);
  };

  // Refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Silently refresh appointments (don't show loading if data exists)
      // Check if we have data before calling
      const hasData = appointments.length > 0;
      fetchAppointments(hasData);
    });

    return unsubscribe;
  }, [navigation, fetchAppointments]);

  if (isLoading) {
    return (
      <View style={styles.appointmentsSection}>
        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        <View style={styles.appointmentsContainer}>
          <DoctorCardSkeleton />
          <DoctorCardSkeleton />
        </View>
      </View>
    );
  }

  if (appointments.length === 0) {
    return (
      <View style={styles.appointmentsSection}>
        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No upcoming appointments</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.appointmentsSection}>
      <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
      <View style={styles.appointmentsContainer}>
        {appointments.map((appointment) => (
          <TouchableOpacity
            key={appointment.id}
            style={styles.appointmentCard}
            onPress={() => handleAppointmentPress(appointment)}
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
              {appointment.doctor.rating !== null && appointment.doctor.rating !== undefined && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>
                    {appointment.doctor.rating}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <ConnectingModal 
        visible={showConnectingModal} 
        doctorName={selectedDoctor?.name || "Dr. Unknown"} 
      />
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
  emptyContainer: {
    paddingVertical: Sizes.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
});

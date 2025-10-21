import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function AppointmentCard({ currentState, onStateChange }) {
  const renderNoAppointments = () => (
    <>
      <Text style={styles.appointmentMessage}>{currentState.message}</Text>
      <TouchableOpacity
        style={styles.appointmentButton}
        onPress={currentState.buttonAction}
      >
        <Text style={styles.appointmentButtonText}>
          {currentState.buttonText}
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderNextAppointment = () => (
    <>
      <Text style={styles.appointmentDateTime}>{currentState.dateTime}</Text>
      <View style={styles.doctorCard}>
        <View style={styles.doctorImageContainer}>
          <Ionicons name="person" size={20} color={Colors.primary} />
        </View>
        <Text style={styles.doctorName}>{currentState.doctor.name}</Text>
      </View>
    </>
  );

  const renderTimeForAppointment = () => (
    <>
      <Text style={styles.appointmentDateTime}>{currentState.doctorTime}</Text>
      <TouchableOpacity
        style={styles.joinButton}
        onPress={currentState.buttonAction}
      >
        <Text style={styles.joinButtonText}>{currentState.buttonText}</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.appointmentCard}>
      <Text style={styles.appointmentTitle}>{currentState.title}</Text>

      {currentState.type === "no_appointments" && renderNoAppointments()}
      {currentState.type === "next_appointment" && renderNextAppointment()}
      {currentState.type === "time_for_appointment" &&
        renderTimeForAppointment()}
    </View>
  );
}

const styles = StyleSheet.create({
  appointmentCard: {
    backgroundColor: Colors.primary,
    marginHorizontal: Sizes.lg,
    marginTop: Sizes.lg,
    borderRadius: 16,
    padding: Sizes.xl,
    alignItems: "center",
  },
  appointmentTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
    marginBottom: Sizes.sm,
  },
  appointmentMessage: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
    marginBottom: Sizes.lg,
  },
  appointmentButton: {
    backgroundColor: Colors.white,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.xl,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  appointmentButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.primary,
  },
  appointmentDateTime: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
    marginBottom: Sizes.md,
  },
  doctorCard: {
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    padding: Sizes.md,
    borderRadius: 12,
  },
  doctorImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
  },
  doctorName: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.xl,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  joinButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
  },
});

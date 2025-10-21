import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  useSafeAreaInsets,
  SafeAreaView,
} from "react-native-safe-area-context";

// Import components
import Header from "../components/Header";
import AppointmentCard from "../components/AppointmentCard";
import PaginationDots from "../components/PaginationDots";
import QuickActionsSection from "../components/QuickActionsSection";
import HealthTipsSection from "../components/HealthTipsSection";
import UpcomingAppointmentsSection from "../components/UpcomingAppointmentsSection";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [currentAppointmentState, setCurrentAppointmentState] = useState(0);

  // Sample data
  const appointmentStates = [
    {
      type: "no_appointments",
      title: "Your Appointments",
      message: "No appointments yet.",
      buttonText: "Book an appointment",
      buttonAction: () => console.log("Book appointment"),
    },
    {
      type: "next_appointment",
      title: "Next Appointment",
      dateTime: "Thursday, Sep 25. 11:00 AM",
      doctor: {
        name: "Dr. Philip Benson",
        specialty: "Cardiologist",
      },
    },
    {
      type: "time_for_appointment",
      title: "Time for your appointment",
      doctorTime: "Dr. Sarah - Today 10:00 AM",
      buttonText: "Join Now",
      buttonAction: () => console.log("Join appointment"),
    },
  ];

  const currentState = appointmentStates[currentAppointmentState];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Header insets={insets} />
        <AppointmentCard
          currentState={currentState}
          onStateChange={setCurrentAppointmentState}
        />
        <PaginationDots
          totalDots={appointmentStates.length}
          activeIndex={currentAppointmentState}
          onDotPress={setCurrentAppointmentState}
        />
        <QuickActionsSection />
        <HealthTipsSection />
        <UpcomingAppointmentsSection />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
});

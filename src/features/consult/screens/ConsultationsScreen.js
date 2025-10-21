import React, { useState } from "react";
import { View, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

// Import components
import ConsultationsHeader from "../components/ConsultationsHeader";
import SearchBar from "../components/SearchBar";
import SpecialtySection from "../components/SpecialtySection";
import AvailableDoctorsSection from "../components/AvailableDoctorsSection";
import EmergencySection from "../components/EmergencySection";

export default function ConsultationsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Implement search functionality
  };

  const handleDoctorPress = (doctor) => {
    console.log("Doctor pressed:", doctor.name);
    // Navigate to doctor details or booking
  };

  const handleSpecialtyPress = (specialty) => {
    console.log("Specialty pressed:", specialty.name);
    // Filter doctors by specialty
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <ConsultationsHeader />

        {/* Search Bar */}
        <SearchBar value={searchQuery} onChangeText={handleSearch} />

        {/* Choose Specialty Section */}
        <SpecialtySection onSpecialtyPress={handleSpecialtyPress} />

        {/* Available Doctors Section */}
        <AvailableDoctorsSection
          onDoctorPress={handleDoctorPress}
          onViewAllPress={() => console.log("View all pressed")}
        />
      </ScrollView>

      {/* Emergency Section - Sticky to bottom */}
      <EmergencySection />
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
  scrollContent: {
    paddingBottom: 100, // Space for emergency section
  },
});

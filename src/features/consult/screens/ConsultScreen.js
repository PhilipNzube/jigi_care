import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";

// Import components
import ConsultationsHeader from "../components/ConsultationsHeader";
import SearchBar from "../components/SearchBar";
import SpecialtySection from "../components/SpecialtySection";
import AvailableDoctorsSection from "../components/AvailableDoctorsSection";
import EmergencySection from "../components/EmergencySection";

export default function ConsultScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const insets = useSafeAreaInsets();

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
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
          <ConsultationsHeader />
          <SearchBar value={searchQuery} onChangeText={handleSearch} />
        </View>

        {/* Choose Specialty Section */}
        <SpecialtySection onSpecialtyPress={handleSpecialtyPress} />

        {/* Available Doctors Section */}
        <AvailableDoctorsSection
          onDoctorPress={handleDoctorPress}
          navigation={navigation}
        />
      </ScrollView>

      {/* Emergency Section - Sticky to bottom */}
      <View
        style={[styles.emergencyContainer, { paddingBottom: insets.bottom }]}
      >
        <EmergencySection />
      </View>
    </View>
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
  headerContainer: {
    backgroundColor: "#F5F5F5",
  },
  emergencyContainer: {
    backgroundColor: "#F5F5F5",
  },
});

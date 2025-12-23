import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import { searchConsultants } from "../services/consultantService";

// Import components
import ConsultationsHeader from "../components/ConsultationsHeader";
import SearchBar from "../components/SearchBar";
import SpecialtySection from "../components/SpecialtySection";
import AvailableDoctorsSection from "../components/AvailableDoctorsSection";
import EmergencySection from "../components/EmergencySection";

export default function ConsultScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const insets = useSafeAreaInsets();
  const searchTimeoutRef = useRef(null);

  // Debounced search function
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If search query is empty, clear results
    if (!searchQuery || searchQuery.trim() === "") {
      setDoctors([]);
      setIsSearching(false);
      return;
    }

    // Set loading state
    setIsSearching(true);

    // Debounce search - wait 500ms after user stops typing
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        console.log("🔍 [CONSULT SCREEN] Searching for:", searchQuery);
        const result = await searchConsultants(searchQuery);
        
        // Map API response to doctor card format
        const mappedDoctors = (result.data || []).map((consultant) => ({
          id: consultant.id || consultant._id,
          name: consultant.fullName || consultant.name || "Dr. Unknown",
          specialty: consultant.speciality || consultant.specialty || "General",
          rating: consultant.rating || 4.5,
          experience: consultant.yrsOfExperience 
            ? `${consultant.yrsOfExperience}+ years experience`
            : "Experienced",
          languages: consultant.languages 
            ? (Array.isArray(consultant.languages) 
                ? consultant.languages.join(", ") 
                : consultant.languages)
            : "English",
          price: consultant.price || "Contact for pricing",
          isAvailable: consultant.availability !== false,
          image: consultant.dp || consultant.profileImage || null,
          // Include full consultant data for navigation
          consultantData: consultant,
        }));

        console.log("✅ [CONSULT SCREEN] Mapped doctors:", JSON.stringify(mappedDoctors, null, 2));
        setDoctors(mappedDoctors);
      } catch (error) {
        console.error("❌ [CONSULT SCREEN] Search error:", error);
        setDoctors([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    // Cleanup timeout on unmount or query change
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
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
          doctors={doctors}
          isLoading={isSearching}
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

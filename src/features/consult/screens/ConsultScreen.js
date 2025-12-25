import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  BackHandler,
  Platform,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Colors, Sizes } from "../../../shared/constants";
import { getConsultantsList } from "../services/consultantService";

// Import components
import ConsultationsHeader from "../components/ConsultationsHeader";
import SearchBar from "../components/SearchBar";
import SpecialtySection from "../components/SpecialtySection";
import AvailableDoctorsSection from "../components/AvailableDoctorsSection";
import EmergencySection from "../components/EmergencySection";

export default function ConsultScreen({ navigation, route }) {
  const [doctors, setDoctors] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  // Refresh when screen comes into focus (tab change)
  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // Silently refresh data (don't show loading if data exists)
      fetchConsultantsList(true);
    });

    return unsubscribe;
  }, [navigation, fetchConsultantsList]);

  // Handle back button - navigate to home
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (Platform.OS === "android") {
          // Navigate to home tab using the tab navigation
          if (navigation.navigate) {
            navigation.navigate("BottomTabs", { screen: "home" });
          }
          return true; // Prevent default back behavior
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [navigation])
  );

  /**
   * Map consultant data from API to doctor card format
   */
  const mapConsultantToDoctor = (consultant) => {
    return {
          id: consultant.id || consultant._id,
          name: consultant.fullName || consultant.name || "Dr. Unknown",
      specialty:
        consultant.speciality || consultant.specialty || "General Practitioner",
      rating: consultant.rating || 4.5, // Dummy rating since not in API
          experience: consultant.yrsOfExperience 
            ? `${consultant.yrsOfExperience}+ years experience`
            : "Experienced",
          languages: consultant.languages 
        ? Array.isArray(consultant.languages)
                ? consultant.languages.join(", ") 
          : consultant.languages
            : "English",
      price: consultant.pricePerSession
        ? `₦${consultant.pricePerSession.toLocaleString()}`
        : "Contact for pricing",
      isAvailable: consultant.availability === true,
          image: consultant.dp || consultant.profileImage || null,
          // Include full consultant data for navigation
          consultantData: consultant,
    };
  };

  /**
   * Fetch consultants list
   */
  const fetchConsultantsList = useCallback(
    async (silent = false) => {
      try {
        // Only show loading if no data exists (first load)
        if (!silent && doctors.length === 0) {
          setIsLoadingList(true);
        }
        console.log("📋 [CONSULT SCREEN] Fetching consultants list...");
        const result = await getConsultantsList();

        // Map API response to doctor card format
        const mappedDoctors = (result.data || []).map(mapConsultantToDoctor);

        console.log(
          "✅ [CONSULT SCREEN] Consultants list loaded:",
          mappedDoctors.length
        );
        setDoctors(mappedDoctors);
      } catch (error) {
        console.error(
          "❌ [CONSULT SCREEN] Error fetching consultants list:",
          error
        );
        // Only clear doctors if this is not a silent refresh
        if (!silent) {
        setDoctors([]);
        }
      } finally {
        setIsLoadingList(false);
      }
    },
    [doctors.length]
  ); // Include doctors.length to check if data exists

  /**
   * Fetch consultants list on mount
   */
  useEffect(() => {
    fetchConsultantsList();
  }, []); // Only run on mount

  const handleSearchPress = () => {
    navigation.navigate("SearchConsultation");
  };

  const handleDoctorPress = (doctor) => {
    console.log("Doctor pressed:", doctor.name);
    // Navigate to doctor details or booking
  };

  const handleSpecialtyPress = (specialty) => {
    console.log("Specialty pressed:", specialty.name);
    // Navigate to search screen with specialty pre-filled
    navigation.navigate("SearchConsultation", { initialQuery: specialty.name });
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchConsultantsList(true);
    } finally {
      setRefreshing(false);
    }
  }, [fetchConsultantsList]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
          <ConsultationsHeader />
          <SearchBar onPress={handleSearchPress} />
        </View>

        {/* Choose Specialty Section */}
        <SpecialtySection
          onSpecialtyPress={handleSpecialtyPress}
          doctors={doctors}
          isLoading={isLoadingList}
        />

        {/* Available Doctors Section */}
        <AvailableDoctorsSection
          doctors={doctors}
          isLoading={isLoadingList}
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

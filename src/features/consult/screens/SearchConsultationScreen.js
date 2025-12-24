import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { searchConsultants } from "../services/consultantService";
import AvailableDoctorsSection from "../components/AvailableDoctorsSection";

export default function SearchConsultationScreen({ navigation, route }) {
  // Get initial query from route params (for specialty search)
  const initialQuery = route?.params?.initialQuery || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [doctors, setDoctors] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const insets = useSafeAreaInsets();
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  // Focus search input on mount
  useEffect(() => {
    // Small delay to ensure screen is mounted
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  }, []);

  // If initial query is provided, trigger search immediately
  useEffect(() => {
    if (initialQuery && initialQuery.trim() !== "") {
      // Set the search query which will trigger the search via the debounced effect
      setSearchQuery(initialQuery);
      // Also trigger immediate search (bypass debounce for initial query)
      const performSearch = async () => {
        setIsSearching(true);
        try {
          console.log("🔍 [SEARCH SCREEN] Initial search for:", initialQuery);
          const result = await searchConsultants(initialQuery);
          const mappedDoctors = (result.data || []).map(mapConsultantToDoctor);
          console.log("✅ [SEARCH SCREEN] Initial search results:", mappedDoctors.length);
          setDoctors(mappedDoctors);
        } catch (error) {
          console.error("❌ [SEARCH SCREEN] Initial search error:", error);
          setDoctors([]);
        } finally {
          setIsSearching(false);
        }
      };
      performSearch();
    }
  }, [initialQuery]);

  /**
   * Map consultant data from API to doctor card format
   */
  const mapConsultantToDoctor = (consultant) => {
    return {
      id: consultant.id || consultant._id,
      name: consultant.fullName || consultant.name || "Dr. Unknown",
      specialty: consultant.speciality || consultant.specialty || "General Practitioner",
      rating: consultant.rating || 4.5, // Dummy rating since not in API
      experience: consultant.yrsOfExperience 
        ? `${consultant.yrsOfExperience}+ years experience`
        : "Experienced",
      languages: consultant.languages 
        ? (Array.isArray(consultant.languages) 
            ? consultant.languages.join(", ") 
            : consultant.languages)
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

  // Debounced search function (skip if this is the initial query from route params)
  useEffect(() => {
    // Skip debounced search if this is the initial query (already handled by initial search effect)
    if (initialQuery && searchQuery === initialQuery) {
      return;
    }

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
        console.log("🔍 [SEARCH SCREEN] Searching for:", searchQuery);
        const result = await searchConsultants(searchQuery);
        
        // Map API response to doctor card format
        const mappedDoctors = (result.data || []).map(mapConsultantToDoctor);

        console.log("✅ [SEARCH SCREEN] Mapped doctors:", mappedDoctors.length);
        setDoctors(mappedDoctors);
      } catch (error) {
        console.error("❌ [SEARCH SCREEN] Search error:", error);
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
  }, [searchQuery, initialQuery]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setDoctors([]);
  };

  const handleDoctorPress = (doctor) => {
    console.log("Doctor pressed:", doctor.name);
    navigation.navigate("DoctorProfile", { doctor });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.searchBarContainer}>
          <Ionicons
            name="search"
            size={20}
            color={Colors.gray}
            style={styles.searchIcon}
          />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search for doctors or specialties"
            placeholderTextColor={Colors.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={Colors.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <AvailableDoctorsSection
          doctors={doctors}
          isLoading={isSearching}
          onDoctorPress={handleDoctorPress}
          navigation={navigation}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    paddingBottom: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Sizes.sm,
    marginLeft: Sizes.sm,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.lightGray,
    borderRadius: 25,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    marginHorizontal: Sizes.lg,
    marginTop: Sizes.sm,
  },
  searchIcon: {
    marginRight: Sizes.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
  },
  clearButton: {
    marginLeft: Sizes.xs,
    padding: Sizes.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Sizes.xl,
  },
});


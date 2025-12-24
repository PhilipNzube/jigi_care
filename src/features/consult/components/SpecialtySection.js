import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";

// Specialty Card Skeleton Component
function SpecialtyCardSkeleton() {
  return (
    <View style={styles.specialtyCard}>
      <ShimmerLoader>
        <View style={styles.skeletonCardBackground}>
          <View style={styles.skeletonOverlay} />
          <View style={styles.cardContent}>
            <View style={styles.skeletonSpecialtyName} />
            <View style={styles.skeletonDoctorCount} />
          </View>
        </View>
      </ShimmerLoader>
    </View>
  );
}

export default function SpecialtySection({ onSpecialtyPress, doctors = [], isLoading = false }) {
  // Calculate specialty counts from doctors list
  const specialties = useMemo(() => {
    // Count doctors by specialty (normalize specialty names)
    const specialtyCounts = {};
    
    doctors.forEach((doctor) => {
      // Normalize specialty name - handle variations
      let specialty = (doctor.specialty || "General Practitioner").trim();
      
      // Normalize common variations
      if (specialty.toLowerCase() === "general practitioner" || 
          specialty.toLowerCase() === "gp" ||
          specialty === "" ||
          !specialty) {
        specialty = "General Practitioner";
      }
      
      specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1;
    });

    // Create specialty cards
    const specialtyList = [];
    
    // Always include "General Practitioner" first (even if count is 0)
    const gpCount = specialtyCounts["General Practitioner"] || 0;
    specialtyList.push({
      id: "general-practitioner",
      name: "General Practitioner",
      doctorCount: gpCount,
      image: Images.consult,
    });

    // Add other specialties (excluding General Practitioner), sorted alphabetically
    Object.keys(specialtyCounts)
      .filter((specialty) => specialty !== "General Practitioner" && specialtyCounts[specialty] > 0)
      .sort()
      .forEach((specialty) => {
        specialtyList.push({
          id: specialty.toLowerCase().replace(/\s+/g, "-"),
          name: specialty,
          doctorCount: specialtyCounts[specialty],
          image: Images.consult,
        });
      });

    return specialtyList;
  }, [doctors]);

  // Show skeleton loaders while loading
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Choose Specialty</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Show 4 skeleton cards */}
          {[1, 2, 3, 4].map((index) => (
            <SpecialtyCardSkeleton key={index} />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Choose Specialty</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {specialties.map((specialty) => (
          <TouchableOpacity
            key={specialty.id}
            style={styles.specialtyCard}
            onPress={() => onSpecialtyPress(specialty)}
          >
            <ImageBackground
              source={specialty.image}
              style={styles.cardBackground}
              imageStyle={styles.cardImage}
            >
              <View style={styles.overlay} />
              <View style={styles.cardContent}>
                <Text style={styles.specialtyName}>{specialty.name}</Text>
                <Text style={styles.doctorCount}>
                  {specialty.doctorCount} doctors
                </Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Sizes.lg,
    backgroundColor: Colors.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginHorizontal: Sizes.lg,
    marginBottom: Sizes.md,
  },
  scrollContent: {
    paddingHorizontal: Sizes.lg,
  },
  specialtyCard: {
    width: 200,
    height: 120,
    marginRight: Sizes.md,
    borderRadius: 12,
    overflow: "hidden",
  },
  cardBackground: {
    flex: 1,
    justifyContent: "flex-end",
  },
  cardImage: {
    borderRadius: 12,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  cardContent: {
    padding: Sizes.md,
  },
  specialtyName: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
    marginBottom: Sizes.xs,
  },
  doctorCount: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
    opacity: 0.9,
  },
  skeletonCardBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
  },
  skeletonOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 12,
  },
  skeletonSpecialtyName: {
    width: 120,
    height: 16,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    marginBottom: Sizes.xs,
    opacity: 0.8,
  },
  skeletonDoctorCount: {
    width: 80,
    height: 14,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    opacity: 0.8,
  },
});

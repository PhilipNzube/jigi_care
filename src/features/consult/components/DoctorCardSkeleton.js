/**
 * Doctor Card Skeleton Loader
 * Skeleton loader matching DoctorCard component structure
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";
import { Colors, Sizes } from "../../../shared/constants";

export default function DoctorCardSkeleton() {
  return (
    <ShimmerLoader>
      <View style={styles.card}>
        {/* Availability Status Skeleton */}
        <View style={styles.availabilityContainer}>
          <View style={styles.availabilityDot} />
          <View style={styles.availabilityText} />
        </View>

        {/* Doctor Info Skeleton */}
        <View style={styles.doctorInfo}>
          <View style={styles.doctorMainInfo}>
            {/* Profile Image Skeleton */}
            <View style={styles.doctorProfileImageContainer} />
            
            {/* Doctor Details Skeleton */}
            <View style={styles.doctorDetails}>
              <View style={styles.doctorName} />
              <View style={styles.doctorSpecialty} />
              <View style={styles.doctorLanguages} />
            </View>
          </View>
          
          {/* Doctor Stats Skeleton */}
          <View style={styles.doctorStats}>
            <View style={styles.ratingContainer}>
              <View style={styles.ratingIcon} />
              <View style={styles.ratingText} />
            </View>
            <View style={styles.experienceText} />
            <View style={styles.priceText} />
            <View style={styles.bookButton} />
          </View>
        </View>
      </View>
    </ShimmerLoader>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.sm,
    marginBottom: Sizes.md,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: Sizes.md,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginRight: Sizes.xs,
  },
  availabilityText: {
    width: 100,
    height: 12,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
  },
  doctorInfo: {
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    padding: Sizes.md,
  },
  doctorMainInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Sizes.md,
  },
  doctorProfileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: Colors.lightGray,
    marginRight: Sizes.md,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    width: "70%",
    height: 16,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginBottom: Sizes.xs,
  },
  doctorSpecialty: {
    width: "50%",
    height: 14,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginBottom: Sizes.xs,
  },
  doctorLanguages: {
    width: "60%",
    height: 12,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
  },
  doctorStats: {
    alignItems: "flex-end",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.xs,
  },
  ratingIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
    marginRight: Sizes.xs,
  },
  ratingText: {
    width: 30,
    height: 14,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
  },
  experienceText: {
    width: 120,
    height: 12,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginBottom: Sizes.xs,
  },
  priceText: {
    width: 80,
    height: 14,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginBottom: Sizes.sm,
  },
  bookButton: {
    width: "100%",
    height: 40,
    borderRadius: 30,
    backgroundColor: Colors.lightGray,
  },
});


import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function DoctorCard({ doctor, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Availability Status */}
      <View style={styles.availabilityContainer}>
        <View style={styles.availabilityDot} />
        <Text style={styles.availabilityText}>Available Now</Text>
      </View>

      {/* Doctor Info */}
      <View style={styles.doctorInfo}>
        <View style={styles.doctorImageContainer}>
          <Image
            source={{
              uri: `https://ui-avatars.com/api/?name=${doctor.name}&background=0098B3&color=fff&size=60`,
            }}
            style={styles.doctorImage}
          />
        </View>

        <View style={styles.doctorDetails}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
          <Text style={styles.doctorLanguages}>
            <Ionicons name="chatbubble-outline" size={14} color="#666" />{" "}
            {doctor.languages}
          </Text>
        </View>

        <View style={styles.doctorStats}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{doctor.rating}</Text>
          </View>
          <Text style={styles.experienceText}>{doctor.experience}</Text>
          <Text style={styles.priceText}>{doctor.price}</Text>
        </View>
      </View>

      {/* Book Now Button */}
      <TouchableOpacity style={styles.bookButton} onPress={onPress}>
        <Text style={styles.bookButtonText}>Book Now</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.lg,
    marginBottom: Sizes.sm,
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
    marginBottom: Sizes.md,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: Sizes.xs,
  },
  availabilityText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#4CAF50",
  },
  doctorInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Sizes.md,
  },
  doctorImageContainer: {
    marginRight: Sizes.md,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: Sizes.xs,
  },
  doctorSpecialty: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
    marginBottom: Sizes.xs,
  },
  doctorLanguages: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#666",
  },
  doctorStats: {
    alignItems: "flex-end",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.xs,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#666",
    marginLeft: Sizes.xs,
  },
  experienceText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#666",
    marginBottom: Sizes.xs,
  },
  priceText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  bookButton: {
    backgroundColor: "#0098B3",
    borderRadius: 8,
    paddingVertical: Sizes.md,
    alignItems: "center",
  },
  bookButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
  },
});

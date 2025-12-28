import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function DoctorProfileCard({ doctor }) {
  if (!doctor) {
    return null;
  }

  const doctorName = doctor.name || "Dr. Unknown";
  const specialty =
    doctor.specialty ||
    doctor.consultantData?.speciality ||
    "General Practitioner";
  const languages = doctor.languages || "English";
  const rating = doctor.rating || 4.5;
  const experience = doctor.experience || "Experienced";
  const price = doctor.price || "Contact for pricing";

  return (
    <View style={styles.card}>
      <View style={styles.doctorInfo}>
        <View style={styles.doctorImageContainer}>
          <Image
            source={{
              uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorName)}&background=0098B3&color=fff&size=80`,
            }}
            style={styles.doctorImage}
          />
        </View>

        <View style={styles.doctorDetails}>
          <Text style={styles.doctorName}>{doctorName}</Text>
          <Text style={styles.doctorSpecialty}>{specialty}</Text>
          <View style={styles.languageContainer}>
            <Ionicons
              name="chatbubble-outline"
              size={12}
              color={Colors.white}
            />
            <Text style={styles.languageText}>{languages}</Text>
          </View>
        </View>

        <View style={styles.doctorStats}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
          <Text style={styles.experienceText}>{experience}</Text>
          <Text style={styles.priceText}>{price}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF1F",
    borderRadius: 16,
    marginHorizontal: Sizes.lg,
    marginTop: Sizes.sm,
    padding: Sizes.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 1,
  },
  doctorInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  doctorImageContainer: {
    marginRight: Sizes.md,
  },
  doctorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
    marginBottom: Sizes.xs,
  },
  doctorSpecialty: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
    opacity: 0.9,
    marginBottom: Sizes.xs,
  },
  languageContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageText: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
    opacity: 0.8,
    marginLeft: Sizes.xs,
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
    color: Colors.white,
    marginLeft: Sizes.xs,
  },
  experienceText: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
    opacity: 0.8,
    marginBottom: Sizes.xs,
  },
  priceText: {
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
});

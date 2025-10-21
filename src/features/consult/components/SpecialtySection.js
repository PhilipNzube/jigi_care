import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

export default function SpecialtySection({ onSpecialtyPress }) {
  const specialties = [
    {
      id: 1,
      name: "General Practitioner",
      doctorCount: 23,
      image: Images.consult, // Using consult image as placeholder
    },
    {
      id: 2,
      name: "Pediatrics",
      doctorCount: 12,
      image: Images.consult, // Using consult image as placeholder
    },
    {
      id: 3,
      name: "Cardiology",
      doctorCount: 8,
      image: Images.consult, // Using consult image as placeholder
    },
    {
      id: 4,
      name: "Dermatology",
      doctorCount: 15,
      image: Images.consult, // Using consult image as placeholder
    },
  ];

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
    fontFamily: "Poppins-Bold",
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
    fontSize: 16,
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
});

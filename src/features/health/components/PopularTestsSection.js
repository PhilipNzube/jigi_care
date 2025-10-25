import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function PopularTestsSection({ tests, onBookTest, onViewAll }) {
  const renderTestCard = (test) => (
    <TouchableOpacity
      key={test.id}
      style={styles.testCard}
      onPress={() => onBookTest(test)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.testDate}>Sep 25th, 2025 • 12:00 PM</Text>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.testItem}>
          <View style={styles.testImageContainer}>
            <View style={styles.testImage} />
          </View>
          <View style={styles.testInfo}>
            <Text style={styles.testName}>{test.name}</Text>
            <Text style={styles.testDescription}>{test.description}</Text>
            <View style={styles.testDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="time" size={16} color="#9E9E9E" />
                <Text style={styles.detailText}>{test.duration}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="information-circle" size={16} color="#9E9E9E" />
                <Text style={styles.detailText}>{test.preparation}</Text>
              </View>
            </View>
          </View>
          <View style={styles.testPriceContainer}>
            <Text style={styles.testPrice}>{test.price}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => onBookTest(test)}
      >
        <Text style={styles.bookButtonText}>Book Now</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular Tests</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.testsContainer}>{tests.map(renderTestCard)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Sizes.lg,
    marginBottom: Sizes.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#0098B3",
  },
  testsContainer: {
    gap: Sizes.md,
  },
  testCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: Sizes.md,
  },
  cardHeader: {
    marginBottom: Sizes.sm,
  },
  testDate: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  cardContent: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: Sizes.md,
    marginBottom: Sizes.md,
  },
  testItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  testImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
  },
  testImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#0098B3",
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  testDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
  },
  testDetails: {
    gap: Sizes.xs,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Sizes.xs,
  },
  detailText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  testPriceContainer: {
    alignItems: "flex-end",
  },
  testPrice: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
  },
  bookButton: {
    backgroundColor: "#0098B3",
    borderRadius: 8,
    paddingVertical: Sizes.sm,
    alignItems: "center",
  },
  bookButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
});

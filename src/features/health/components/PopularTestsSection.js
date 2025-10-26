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
      <View style={styles.testHeader}>
        <View style={styles.testInfo}>
          <View style={styles.testIcon}>
            <Ionicons name="time" size={16} color={Colors.textSecondary} />
            <Text style={styles.testDuration}>{test.duration}</Text>
          </View>
          <View style={styles.testIcon}>
            <Ionicons
              name="information-circle"
              size={16}
              color={Colors.textSecondary}
            />
            <Text style={styles.testPreparation}>{test.preparation}</Text>
          </View>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.testContent}>
          <Image source={test.image} style={styles.testImage} />
          <View style={styles.testDetails}>
            <View style={styles.testNameRow}>
              <Text style={styles.testName}>{test.name}</Text>
              <Text style={styles.testPrice}>{test.price}</Text>
            </View>
            <Text style={styles.testDescription}>{test.description}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => onBookTest(test)}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
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
    padding: Sizes.sm,
    marginBottom: Sizes.md,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  content: {
    padding: Sizes.md,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
  },
  testHeader: {
    marginBottom: Sizes.xs,
  },
  testInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  testIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: Sizes.xs,
  },
  testDuration: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#999999",
  },
  testPreparation: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#999999",
  },
  testContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  testImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
    marginRight: Sizes.md,
  },
  testDetails: {
    flex: 1,
  },
  testNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.xs,
  },
  testName: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    flex: 1,
  },
  testDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#5B6B62",
  },
  testPrice: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
  },
  bookButton: {
    backgroundColor: "#0098B3",
    borderRadius: 25,
    paddingVertical: Sizes.sm,
    alignItems: "center",
  },
  bookButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
});

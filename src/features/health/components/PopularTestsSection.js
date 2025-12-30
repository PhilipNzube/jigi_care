import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import { getPopularTests } from "../services/labTestService";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";

export default function PopularTestsSection({ onBookTest, onViewAll }) {
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPopularTests();
  }, []);

  const fetchPopularTests = async () => {
    try {
      setIsLoading(true);
      const response = await getPopularTests();
      const testsData = response.data || [];
      
      // Map API data to component format
      const mappedTests = testsData.slice(0, 3).map((test) => ({
        id: test.id,
        name: test.title,
        description: test.description,
        price: `₦${test.amount?.toLocaleString() || "0"}`,
        duration: `${test.durationInHrs || 24} hours`,
        preparation: test.preparation || "No preparation required",
        image: Images.placeholder,
        testData: test, // Keep original data for booking
      }));
      
      setTests(mappedTests);
    } catch (error) {
      console.error("❌ [POPULAR TESTS] Error fetching tests:", error);
      setTests([]);
    } finally {
      setIsLoading(false);
    }
  };
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

  const renderSkeleton = () => (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <ShimmerLoader>
          <View style={{ width: 120, height: 20, borderRadius: 4 }} />
        </ShimmerLoader>
        <ShimmerLoader>
          <View style={{ width: 60, height: 16, borderRadius: 4 }} />
        </ShimmerLoader>
      </View>
      {[1, 2, 3].map((i) => (
        <ShimmerLoader key={i}>
          <View style={styles.testCard}>
            <View style={{ width: "100%", height: 150, borderRadius: 12, marginBottom: Sizes.md }} />
          </View>
        </ShimmerLoader>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular Tests</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        renderSkeleton()
      ) : (
        <View style={styles.testsContainer}>{tests.map(renderTestCard)}</View>
      )}
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

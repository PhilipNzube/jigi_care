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
import { Images } from "../../../shared/utils/imageUtils";
import { searchTests } from "../services/labTestService";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";

export default function SearchLabTestScreen({ navigation, route }) {
  const initialQuery = route?.params?.initialQuery || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [tests, setTests] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const insets = useSafeAreaInsets();
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    if (initialQuery && initialQuery.trim() !== "") {
      setSearchQuery(initialQuery);
      const performSearch = async () => {
        setIsSearching(true);
        try {
          const result = await searchTests({ search: initialQuery });
          const mappedTests = (result.data || []).map(mapTestToCard);
          setTests(mappedTests);
        } catch (error) {
          console.error("❌ [SEARCH LAB TEST] Initial search error:", error);
          setTests([]);
        } finally {
          setIsSearching(false);
        }
      };
      performSearch();
    }
  }, [initialQuery]);

  const mapTestToCard = (test) => ({
    id: test.id,
    name: test.title,
    description: test.description,
    price: `₦${test.amount?.toLocaleString() || "0"}`,
    duration: `${test.durationInHrs || 24} hours`,
    preparation: test.preparation || "No preparation required",
    image: Images.placeholder,
    testData: test,
  });

  useEffect(() => {
    if (initialQuery && searchQuery === initialQuery) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery || searchQuery.trim() === "") {
      setTests([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await searchTests({ search: searchQuery });
        const mappedTests = (result.data || []).map(mapTestToCard);
        setTests(mappedTests);
      } catch (error) {
        console.error("❌ [SEARCH LAB TEST] Search error:", error);
        setTests([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, initialQuery]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setTests([]);
  };

  const handleTestPress = (test) => {
    navigation.navigate("BookLabTest", { test });
  };

  const renderTestCard = (test) => (
    <TouchableOpacity
      key={test.id}
      style={styles.testCard}
      onPress={() => handleTestPress(test)}
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
      <View style={styles.testContentWrapper}>
        <View style={styles.testContent}>
          <View style={styles.testImageContainer}>
            <View style={styles.testImage} />
          </View>
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
          onPress={() => handleTestPress(test)}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((i) => (
        <ShimmerLoader key={i}>
          <View style={styles.testCard}>
            <View style={{ width: "100%", height: 150, borderRadius: 12 }} />
          </View>
        </ShimmerLoader>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
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
            placeholder="Search for tests"
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

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isSearching ? (
          renderSkeleton()
        ) : tests.length > 0 ? (
          <View style={styles.testsContainer}>
            {tests.map(renderTestCard)}
          </View>
        ) : searchQuery.trim() !== "" ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="flask-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No tests found</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
    paddingBottom: Sizes.md,
    backgroundColor: "#F5F5F5",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.sm,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: Sizes.md,
    height: 48,
  },
  searchIcon: {
    marginRight: Sizes.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: Sizes.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.md,
  },
  skeletonContainer: {
    gap: Sizes.md,
  },
  testsContainer: {
    gap: Sizes.md,
  },
  testCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.sm,
    marginBottom: Sizes.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
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
  testContentWrapper: {
    padding: Sizes.md,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
  },
  testContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  testImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#FF6B6B",
    marginRight: Sizes.md,
    justifyContent: "center",
    alignItems: "center",
  },
  testImage: {
    width: 24,
    height: 24,
    backgroundColor: Colors.white,
    borderRadius: 4,
  },
  testDetails: {
    flex: 1,
    marginRight: Sizes.sm,
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
    color: "#000",
    flex: 1,
  },
  testPrice: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
  },
  testDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Sizes.xxl,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
    marginTop: Sizes.md,
  },
});


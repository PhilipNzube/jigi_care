import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Image,
  BackHandler,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import { searchTests } from "../services/labTestService";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";

// Test Card Component
const TestCard = ({ test, onBookTest }) => {
  return (
    <TouchableOpacity style={styles.testCard} onPress={() => onBookTest(test)}>
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
          <Image
            source={test.image || Images.placeholder}
            style={styles.testImage}
          />
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
};

// Skeleton Component
function TestCardSkeleton() {
  return (
    <ShimmerLoader>
      <View style={styles.testCard}>
        <View style={{ width: "100%", height: 150, borderRadius: 12 }} />
      </View>
    </ShimmerLoader>
  );
}

export default function ViewAllTestsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const searchTimeoutRef = useRef(null);

  // Handle Android back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (Platform.OS === "android") {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            // Navigate to home if there's no previous screen
            navigation.navigate("BottomTabs", { screen: "home" });
          }
          return true; // Prevent default back behavior
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [navigation])
  );

  const fetchTests = useCallback(
    async (page = 1, silent = false, query = searchQuery) => {
      if (!silent) {
        setIsLoading(true);
      }

      try {
        const response = await searchTests({
          search: query.trim(),
          page,
          limit: 10,
        });

        const items = response.data || [];
        if (page === 1) {
          setTests(items);

          // Extract unique categories from fetched tests
          const uniqueCategories = new Set();
          items.forEach((test) => {
            // Extract category from title or description
            // You can adjust this logic based on your API response structure
            if (test.title) {
              // Try to extract category from title (e.g., "Blood Test", "Liver Function Test")
              const titleWords = test.title.split(" ");
              if (titleWords.length > 0) {
                // Use first significant word as category, or use title if short
                const potentialCategory =
                  titleWords.length <= 3 ? test.title : titleWords[0];
                if (potentialCategory && potentialCategory.length > 2) {
                  uniqueCategories.add(potentialCategory);
                }
              }
            }
          });

          // Convert Set to Array and sort
          const categoriesList = Array.from(uniqueCategories).sort();
          setCategories(categoriesList.length > 0 ? categoriesList : []);
        } else {
          setTests((prev) => [...prev, ...items]);
        }

        // Calculate total pages (assuming 10 items per page)
        const calculatedTotalPages = Math.ceil(
          (response.total || items.length) / 10
        );
        setTotalPages(calculatedTotalPages || 1);
        setCurrentPage(page);
      } catch (error) {
        console.error("❌ [VIEW ALL TESTS] Error fetching tests:", error);
        setTests([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [searchQuery]
  );

  useEffect(() => {
    fetchTests(1);
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchTests(1);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, fetchTests]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTests(1, true);
  }, [fetchTests]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchTests(page);
    }
  };

  const handleBookTest = (test) => {
    navigation.navigate("BookLabTest", { test });
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    fetchTests(1);
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    fetchTests(1);
  };

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

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.paginationButton,
            currentPage === 1 && styles.paginationButtonDisabled,
          ]}
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={currentPage === 1 ? Colors.gray : Colors.primary}
          />
        </TouchableOpacity>

        {startPage > 1 && (
          <>
            <TouchableOpacity
              style={styles.paginationButton}
              onPress={() => handlePageChange(1)}
            >
              <Text style={styles.paginationText}>1</Text>
            </TouchableOpacity>
            {startPage > 2 && (
              <Text style={styles.paginationEllipsis}>...</Text>
            )}
          </>
        )}

        {pages.map((page) => (
          <TouchableOpacity
            key={page}
            style={[
              styles.paginationButton,
              currentPage === page && styles.paginationButtonActive,
            ]}
            onPress={() => handlePageChange(page)}
          >
            <Text
              style={[
                styles.paginationText,
                currentPage === page && styles.paginationTextActive,
              ]}
            >
              {page}
            </Text>
          </TouchableOpacity>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <Text style={styles.paginationEllipsis}>...</Text>
            )}
            <TouchableOpacity
              style={styles.paginationButton}
              onPress={() => handlePageChange(totalPages)}
            >
              <Text style={styles.paginationText}>{totalPages}</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[
            styles.paginationButton,
            currentPage === totalPages && styles.paginationButtonDisabled,
          ]}
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={currentPage === totalPages ? Colors.gray : Colors.primary}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              // Navigate to home if there's no previous screen
              navigation.navigate("BottomTabs", { screen: "home" });
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Tests</Text>
      </View>

      {/* Search Bar and Filter Button */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={Colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tests..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={24} color={Colors.primary} />
          {selectedCategory && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <>
            <TestCardSkeleton />
            <TestCardSkeleton />
            <TestCardSkeleton />
          </>
        ) : tests.length > 0 ? (
          <>
            {tests.map((test) => (
              <TestCard
                key={test.id}
                test={mapTestToCard(test)}
                onBookTest={handleBookTest}
              />
            ))}
            {renderPagination()}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="flask-outline"
              size={48}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyText}>
              {searchQuery
                ? "No tests found matching your search"
                : "No tests available"}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowFilters(false)}
          />
          <View
            style={[
              styles.modalContent,
              { paddingBottom: Math.max(insets.bottom, Sizes.xl) },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Tests</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Category</Text>
                {categories.length > 0 ? (
                  <View style={styles.filterOptions}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.filterChip,
                          selectedCategory === category &&
                            styles.filterChipActive,
                        ]}
                        onPress={() =>
                          setSelectedCategory(
                            selectedCategory === category ? "" : category
                          )
                        }
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            selectedCategory === category &&
                              styles.filterChipTextActive,
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyFiltersText}>
                    No categories available
                  </Text>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={handleClearFilters}
              >
                <Text style={styles.clearFiltersText}>Clear Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyFiltersButton}
                onPress={handleApplyFilters}
              >
                <Text style={styles.applyFiltersText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
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
    paddingVertical: Sizes.md,
    backgroundColor: "#F5F5F5",
    position: "relative",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: Sizes.lg,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  searchFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Sizes.lg,
    marginBottom: Sizes.md,
    gap: Sizes.sm,
  },
  searchContainer: {
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
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: Sizes.sm,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
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
  testImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
    marginRight: Sizes.md,
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
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.xxl,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Sizes.xl,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
    marginTop: Sizes.md,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Sizes.lg,
    gap: Sizes.xs,
  },
  paginationButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  paginationButtonActive: {
    backgroundColor: Colors.primary,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
  },
  paginationTextActive: {
    color: Colors.white,
  },
  paginationEllipsis: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
    paddingHorizontal: Sizes.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalOverlayTouchable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Sizes.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
  },
  modalScroll: {
    padding: Sizes.lg,
  },
  filterSection: {
    marginBottom: Sizes.xl,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Sizes.sm,
  },
  filterChip: {
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  modalFooter: {
    flexDirection: "row",
    padding: Sizes.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Sizes.md,
  },
  clearFiltersButton: {
    flex: 1,
    paddingVertical: Sizes.md,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: "center",
  },
  clearFiltersText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  applyFiltersButton: {
    flex: 1,
    paddingVertical: Sizes.md,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  applyFiltersText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
    includeFontPadding: false,
  },
  emptyFiltersText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
});

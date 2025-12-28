import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { searchMedications } from "../services/medicationService";
import MedicationCard from "../components/MedicationCard";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";

export default function SearchMedicationScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [medications, setMedications] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStockStatus, setSelectedStockStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  const categories = [
    "Pain Relief",
    "Antibiotics",
    "Cough",
    "Fever",
    "Allergy",
    "Vitamins",
  ];

  const stockStatusOptions = [
    { label: "In Stock", value: "in_stock" },
    { label: "Out of Stock", value: "out_of_stock" },
    { label: "Low Stock", value: "low_stock" },
  ];

  // Focus search input on mount
  useEffect(() => {
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  }, []);

  // Debounced search function
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery || searchQuery.trim() === "") {
      setMedications([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setCurrentPage(1);

    searchTimeoutRef.current = setTimeout(async () => {
      await performSearch(1);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedCategory, selectedStockStatus]);

  const performSearch = async (page = 1) => {
    try {
      const params = {
        search: searchQuery,
        category: selectedCategory,
        stockStatus: selectedStockStatus,
        page,
        limit: 10,
      };

      const response = await searchMedications(params);
      const items = response.items || [];

      if (page === 1) {
        setMedications(items);
      } else {
        setMedications((prev) => [...prev, ...items]);
      }

      setTotalPages(response.totalPages || 1);
      setTotal(response.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error("❌ [SEARCH MEDICATION] Search error:", error);
      setMedications([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setMedications([]);
    setSelectedCategory("");
    setSelectedStockStatus("");
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedStockStatus("");
    setCurrentPage(1);
    if (searchQuery) {
      performSearch(1);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      performSearch(page);
    }
  };

  const mapMedicationToCard = (medication) => {
    const getStatusColor = (status) => {
      switch (status) {
        case "in_stock":
          return "#009A4914";
        case "out_of_stock":
          return "#EA4D4D14";
        case "low_stock":
          return "#FF980014";
        default:
          return "#009A4914";
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case "in_stock":
          return "In stock";
        case "out_of_stock":
          return "Out of Stock";
        case "low_stock":
          return "Low stock";
        default:
          return "In stock";
      }
    };

    return {
      id: medication.id,
      name: medication.name,
      rating: medication.rating || 4.5,
      dosage: `${medication.gram}mg`,
      description: medication.description || "",
      price: medication.price || 0,
      status: getStatusText(medication.stockStatus),
      statusColor: getStatusColor(medication.stockStatus),
      medicationData: medication,
    };
  };

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
          style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
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
            {startPage > 2 && <Text style={styles.paginationEllipsis}>...</Text>}
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
    <View style={styles.container}>
      {/* Header */}
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
            placeholder="Search for medications..."
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
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={24} color={Colors.primary} />
          {(selectedCategory || selectedStockStatus) && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isSearching && medications.length === 0 ? (
          <View style={styles.loadingContainer}>
            {[1, 2, 3].map((i) => (
              <ShimmerLoader key={i} style={styles.shimmerCard} />
            ))}
          </View>
        ) : medications.length > 0 ? (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                {total} {total === 1 ? "result" : "results"} found
              </Text>
            </View>
            {medications.map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={mapMedicationToCard(medication)}
                onAddToCart={() => {
                  // Handle add to cart
                  console.log("Add to cart:", medication.name);
                }}
              />
            ))}
            {renderPagination()}
          </>
        ) : searchQuery ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={Colors.gray} />
            <Text style={styles.emptyTitle}>No medications found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or filters
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Medications</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Category Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Category</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      !selectedCategory && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedCategory("")}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        !selectedCategory && styles.filterChipTextActive,
                      ]}
                    >
                      All
                    </Text>
                  </TouchableOpacity>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.filterChip,
                        selectedCategory === category && styles.filterChipActive,
                      ]}
                      onPress={() => setSelectedCategory(category)}
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
              </View>

              {/* Stock Status Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Stock Status</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      !selectedStockStatus && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedStockStatus("")}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        !selectedStockStatus && styles.filterChipTextActive,
                      ]}
                    >
                      All
                    </Text>
                  </TouchableOpacity>
                  {stockStatusOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.filterChip,
                        selectedStockStatus === option.value &&
                          styles.filterChipActive,
                      ]}
                      onPress={() => setSelectedStockStatus(option.value)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedStockStatus === option.value &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
                onPress={() => {
                  setShowFilters(false);
                  if (searchQuery) {
                    performSearch(1);
                  }
                }}
              >
                <Text style={styles.applyFiltersText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    paddingBottom: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: Sizes.sm,
    marginLeft: Sizes.sm,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.lightGray,
    borderRadius: 25,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    marginHorizontal: Sizes.sm,
  },
  searchIcon: {
    marginRight: Sizes.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  clearButton: {
    marginLeft: Sizes.xs,
    padding: Sizes.xs,
  },
  filterButton: {
    padding: Sizes.sm,
    marginRight: Sizes.sm,
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F44336",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Sizes.lg,
    paddingBottom: Sizes.xl,
  },
  loadingContainer: {
    paddingVertical: Sizes.lg,
  },
  shimmerCard: {
    height: 150,
    borderRadius: 12,
    marginBottom: Sizes.md,
  },
  resultsHeader: {
    marginBottom: Sizes.md,
  },
  resultsText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Sizes.xl * 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginTop: Sizes.md,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    marginTop: Sizes.xs,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Sizes.xl,
    marginBottom: Sizes.lg,
  },
  paginationButton: {
    minWidth: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paginationButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  paginationTextActive: {
    color: Colors.white,
  },
  paginationEllipsis: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    marginHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
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
    marginRight: Sizes.sm,
    marginBottom: Sizes.sm,
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
});


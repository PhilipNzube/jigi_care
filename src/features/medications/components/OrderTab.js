import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import MedicationCard from "./MedicationCard";
import RequestMedicationModal from "../modals/RequestMedicationModal";
import {
  searchMedications,
  addItemToCart,
  getCart,
} from "../services/medicationService";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";
import EmptyState from "../../../shared/components/EmptyState";
import { showError, showSuccess } from "../../../shared/utils/toast";

// Medication Card Skeleton Component
function MedicationCardSkeleton() {
  return (
    <ShimmerLoader>
      <View style={skeletonStyles.skeletonCard}>
        <View style={skeletonStyles.skeletonContent}>
          <View style={skeletonStyles.skeletonMedicationInfo}>
            <View style={skeletonStyles.skeletonImage} />
            <View style={skeletonStyles.skeletonDetails}>
              <View style={skeletonStyles.skeletonNameRow} />
              <View style={skeletonStyles.skeletonRating} />
              <View style={skeletonStyles.skeletonDosage} />
              <View style={skeletonStyles.skeletonDescription} />
              <View style={skeletonStyles.skeletonPrice} />
            </View>
          </View>
          <View style={skeletonStyles.skeletonButton} />
        </View>
      </View>
    </ShimmerLoader>
  );
}

export default function OrderTab({ navigation }) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [medications, setMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [loadingMedications, setLoadingMedications] = useState(new Set());

  const loadPopularMedications = useCallback(
    async (page = 1, silent = false) => {
      if (!silent) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await searchMedications({
          page,
          limit: 10,
        });

        const items = response.items || [];
        if (page === 1) {
          setMedications(items);
        } else {
          setMedications((prev) => [...prev, ...items]);
        }

        setTotalPages(response.totalPages || 1);
        setCurrentPage(page);
      } catch (err) {
        console.error("❌ [ORDER TAB] Error loading medications:", err);
        setError(err.message || "Failed to load medications");
        setMedications([]);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  const fetchCartCount = useCallback(async () => {
    try {
      const cartData = await getCart();
      const count =
        cartData.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setCartItemCount(count);
    } catch (error) {
      console.error("❌ [ORDER TAB] Error fetching cart count:", error);
    }
  }, []);

  // Load popular medications on mount
  useEffect(() => {
    loadPopularMedications(1);
    fetchCartCount();
  }, [loadPopularMedications, fetchCartCount]);

  // Refresh when tab comes into focus
  useFocusEffect(
    useCallback(() => {
      if (medications.length > 0) {
        loadPopularMedications(1, true);
      } else {
        loadPopularMedications(1, false);
      }
      fetchCartCount();
    }, [medications.length, loadPopularMedications, fetchCartCount])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPopularMedications(1, true);
  }, [loadPopularMedications]);

  const handleSearchPress = () => {
    navigation.navigate("SearchMedication");
  };

  const handleRequestMedication = () => {
    setShowRequestModal(true);
  };

  const handleAddToCart = async (medication) => {
    const medicationId = medication.id || medication.medicationData?.id;
    if (!medicationId) return;

    try {
      // Set loading state for this medication
      setLoadingMedications((prev) => new Set(prev).add(medicationId));

      await addItemToCart(medicationId, 1);
      showSuccess("Added to cart");
      fetchCartCount();
    } catch (error) {
      console.error("❌ [ORDER TAB] Error adding to cart:", error);
      showError("Unable to add item to cart. Please try again.");
    } finally {
      // Remove loading state
      setLoadingMedications((prev) => {
        const newSet = new Set(prev);
        newSet.delete(medicationId);
        return newSet;
      });
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      loadPopularMedications(page);
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
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={[styles.searchBar, isSearchFocused && styles.searchBarFocused]}
          onPress={handleSearchPress}
        >
          <Ionicons name="search" size={20} color={Colors.grey} />
          <Text style={styles.searchPlaceholder}>Search for medication...</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate("Cart")}
        >
          <Ionicons name="cart" size={24} color={Colors.black} />
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartItemCount > 99 ? "99+" : cartItemCount.toString()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Popular Medication</Text>

        {isLoading ? (
          <View>
            {[1, 2, 3, 4].map((i) => (
              <MedicationCardSkeleton key={i} />
            ))}
          </View>
        ) : error ? (
          <EmptyState
            variant="error"
            icon="alert-circle-outline"
            title="Error Loading Medications"
            message={error}
            actionLabel="Try Again"
            onAction={() => loadPopularMedications(1)}
          />
        ) : medications.length === 0 ? (
          <EmptyState
            icon="medical-outline"
            title="No Medications Available"
            message="There are no medications available at the moment. Please check back later."
          />
        ) : (
          <>
            {medications.map((medication) => {
              const medicationId =
                medication.id || medication.medicationData?.id;
              return (
                <MedicationCard
                  key={medication.id}
                  medication={mapMedicationToCard(medication)}
                  onAddToCart={() =>
                    handleAddToCart(medication.medicationData || medication)
                  }
                  isLoading={loadingMedications.has(medicationId)}
                />
              );
            })}
            {renderPagination()}
          </>
        )}
      </ScrollView>

      <RequestMedicationModal
        visible={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 50,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.md,
    marginRight: Sizes.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  searchBarFocused: {
    borderColor: "#0098B3",
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: Sizes.sm,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    includeFontPadding: false,
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
  cartButton: {
    position: "relative",
    padding: Sizes.sm,
  },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#F44336",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    includeFontPadding: false,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginBottom: Sizes.md,
  },
});

// Skeleton styles
const skeletonStyles = StyleSheet.create({
  skeletonCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.sm,
    marginBottom: Sizes.md,
  },
  skeletonContent: {
    padding: Sizes.md,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
  },
  skeletonMedicationInfo: {
    flexDirection: "row",
    marginBottom: Sizes.md,
  },
  skeletonImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
    marginRight: Sizes.sm,
  },
  skeletonDetails: {
    flex: 1,
  },
  skeletonNameRow: {
    height: 16,
    width: "60%",
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginBottom: Sizes.xs,
  },
  skeletonRating: {
    height: 12,
    width: "30%",
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginBottom: Sizes.xs,
  },
  skeletonDosage: {
    height: 12,
    width: "40%",
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginBottom: Sizes.xs / 2,
  },
  skeletonDescription: {
    height: 12,
    width: "80%",
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginBottom: Sizes.xs,
  },
  skeletonPrice: {
    height: 16,
    width: "25%",
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
  },
  skeletonButton: {
    height: 40,
    width: "100%",
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    marginTop: Sizes.sm,
  },
});

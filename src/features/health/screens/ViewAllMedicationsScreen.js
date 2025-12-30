import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import { searchMedications } from "../../medications/services/medicationService";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";
import { format } from "date-fns";

// Medication Card Component
const MedicationCard = ({ medication }) => {
  const formatDosage = (medication) => {
    const gram = medication.gram || "";
    if (gram) {
      return `${gram}mg`;
    }
    return "As prescribed";
  };

  const getStatusInfo = (medication) => {
    const stockStatus = medication.stockStatus || "in_stock";
    
    switch (stockStatus) {
      case "out_of_stock":
        return { text: "Out of Stock", bgColor: "#EA4D4D1F", textColor: "#EA4D4D" };
      case "low_stock":
        return { text: "Running Low", bgColor: "#F2C94C1F", textColor: "#856404" };
      case "in_stock":
      default:
        return { text: "In Stock", bgColor: "#0098B314", textColor: "#0098B3" };
    }
  };

  const statusInfo = getStatusInfo(medication);
  const medicationName = medication.name || "Unknown Medication";
  const dosage = formatDosage(medication);
  const description = medication.description || "";
  const price = medication.price || 0;
  
  // Format date - use current date/time for today's medications
  const now = new Date();
  const formattedDate = format(now, "MMM dd, yyyy");
  const formattedTime = format(now, "h:mm a");

  return (
    <View style={styles.medicationCard}>
      <View style={styles.medicationHeader}>
        <Text style={styles.medicationDate}>
          {formattedDate} • {formattedTime}
        </Text>
        {/* <View style={styles.statusRow}>
          <View style={styles.checkbox}>
            <Ionicons name="checkmark" size={16} color={Colors.white} />
          </View>
          <Text style={styles.statusText}>Taken</Text>
        </View> */}
      </View>
      <View style={styles.medicationContent}>
        <View style={styles.medicationItem}>
          <Image source={Images.placeholder} style={styles.medicationImage} />
            <View style={styles.medicationInfo}>
              <Text style={styles.medicationName}>{medicationName}</Text>
              <Text style={styles.medicationDosage}>{dosage}</Text>
              {price > 0 && (
                <Text style={styles.medicationPrice}>₦{price.toLocaleString()}</Text>
              )}
              {description ? (
                <Text style={styles.medicationDescription} numberOfLines={2}>
                  {description}
                </Text>
              ) : null}
            </View>
          <View style={styles.medicationStatus}>
            <View style={[styles.statusTag, { backgroundColor: statusInfo.bgColor }]}>
              <Text style={[styles.statusTagText, { color: statusInfo.textColor }]}>
                {statusInfo.text}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

// Skeleton Component
function MedicationCardSkeleton() {
  return (
    <ShimmerLoader>
      <View style={styles.medicationCard}>
        <View style={styles.medicationHeader}>
          <View style={{ width: 150, height: 12, borderRadius: 4 }} />
          <View style={{ width: 60, height: 20, borderRadius: 4 }} />
        </View>
        <View style={styles.medicationContent}>
          <View style={styles.medicationItem}>
            <Image source={Images.placeholder} style={styles.medicationImage} />
            <View style={styles.medicationInfo}>
              <View style={{ width: 120, height: 14, borderRadius: 4, marginBottom: Sizes.xs }} />
              <View style={{ width: 100, height: 12, borderRadius: 4, marginBottom: Sizes.xs }} />
              <View style={{ width: 80, height: 12, borderRadius: 4, marginBottom: Sizes.xs }} />
              <View style={{ width: 150, height: 12, borderRadius: 4 }} />
            </View>
            <View style={{ width: 80, height: 24, borderRadius: 12 }} />
          </View>
        </View>
      </View>
    </ShimmerLoader>
  );
}

export default function ViewAllMedicationsScreen({ navigation }) {
  const [medications, setMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStockStatus, setSelectedStockStatus] = useState("");

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

  const fetchMedications = useCallback(async (page = 1, silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }

    try {
      const response = await searchMedications({
        page,
        limit: 10,
        search: searchQuery.trim(),
        category: selectedCategory,
        stockStatus: selectedStockStatus,
      });
      
      const items = response.items || [];
      if (page === 1) {
        setMedications(items);
      } else {
        setMedications((prev) => [...prev, ...items]);
      }
      
      setTotalPages(response.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error("❌ [VIEW ALL MEDICATIONS] Error fetching medications:", error);
      setMedications([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedCategory, selectedStockStatus]);

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedStockStatus("");
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    fetchMedications(1);
  };

  useEffect(() => {
    fetchMedications(1);
  }, [fetchMedications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMedications(1, true);
  }, [fetchMedications]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Medications</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medications..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
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

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isLoading ? (
          <>
            <MedicationCardSkeleton />
            <MedicationCardSkeleton />
            <MedicationCardSkeleton />
          </>
        ) : medications.length > 0 ? (
          medications.map((medication) => (
            <MedicationCard key={medication.id} medication={medication} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>
              {searchQuery ? "No medications found" : "No medications available"}
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
                onPress={handleApplyFilters}
              >
                <Text style={styles.applyFiltersText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  searchBarRow: {
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
    backgroundColor: "#F44336",
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
  content: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
  },
  medicationCard: {
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
  medicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  medicationDate: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.xs,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#C89A0F",
  },
  medicationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  medicationImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Sizes.md,
  },
  medicationInfo: {
    flex: 1,
    marginRight: Sizes.sm,
  },
  medicationName: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#000",
    marginBottom: Sizes.xs,
  },
  medicationDosage: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#5B6B62",
    marginBottom: Sizes.xs,
  },
  medicationPrice: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
    marginBottom: Sizes.xs,
  },
  medicationDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  medicationStatus: {
    alignItems: "flex-end",
  },
  statusTag: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTagText: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
  },
  medicationContent: {
    padding: Sizes.md,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
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


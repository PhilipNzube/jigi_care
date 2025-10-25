import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import MedicationCard from "./MedicationCard";
import RequestMedicationModal from "../modals/RequestMedicationModal";

export default function OrderTab({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const medications = [
    {
      id: 1,
      name: "Acetaminophen",
      rating: 4.6,
      dosage: "500mg",
      description: "Pain reliever and fever reducer",
      price: 5200,
      status: "In stock",
      statusColor: "#009A4914",
      image: "acetaminophen",
    },
    {
      id: 2,
      name: "Equate",
      rating: 4.6,
      dosage: "25mg",
      description: "Antihistamine for allergy symptoms",
      price: 8500,
      status: "Out of Stock",
      statusColor: "#EA4D4D14",
      image: "equate",
    },
    {
      id: 3,
      name: "Omega-3",
      rating: 4.6,
      dosage: "1000mg",
      description: "Fish oil supplement for heart health",
      price: 3100,
      status: "In stock",
      statusColor: "#009A4914",
      image: "omega3",
    },
    {
      id: 4,
      name: "Ibuprofen",
      rating: 4.6,
      dosage: "200mg",
      description: "Pain relief and anti-inflammatory",
      price: 2500,
      status: "In stock",
      statusColor: "#009A4914",
      image: "ibuprofen",
    },
  ];

  const filteredMedications = medications.filter((med) =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRequestMedication = () => {
    setShowRequestModal(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View
          style={[styles.searchBar, isSearchFocused && styles.searchBarFocused]}
        >
          <Ionicons name="search" size={20} color={Colors.grey} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for medication..."
            placeholderTextColor={Colors.grey}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate("Cart")}
        >
          <Ionicons name="cart" size={24} color={Colors.black} />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      {filteredMedications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Can't find your medication?</Text>
          <Text style={styles.emptySubtitle}>You can request it below</Text>
          <TouchableOpacity
            style={styles.requestButton}
            onPress={handleRequestMedication}
          >
            <Text style={styles.requestButtonText}>Request Medication</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Popular Medication</Text>
          {filteredMedications.map((medication) => (
            <MedicationCard
              key={medication.id}
              medication={medication}
              onAddToCart={() => {}}
            />
          ))}
        </ScrollView>
      )}

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
    paddingVertical: Sizes.xs,
    marginRight: Sizes.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  searchBarFocused: {
    borderColor: "#0098B3",
  },
  searchInput: {
    flex: 1,
    marginLeft: Sizes.sm,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
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
    color: Colors.black,
    marginBottom: Sizes.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    marginBottom: Sizes.xl,
  },
  requestButton: {
    backgroundColor: "#0098B3",
    paddingHorizontal: Sizes.xl,
    paddingVertical: Sizes.md,
    borderRadius: 25,
  },
  requestButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
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

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import CategoryFilters from "../components/CategoryFilters";
import SearchBar from "../components/SearchBar";
import FeatureCards from "../components/FeatureCards";
import PopularTestsSection from "../components/PopularTestsSection";
import RecentResultsSection from "../components/RecentResultsSection";

export default function LabTestScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", name: "All Test" },
    { id: "diabetes", name: "Diabetes" },
    { id: "cholesterol", name: "Cholesterol" },
    { id: "obesity", name: "Obesity" },
  ];

  const popularTests = [
    {
      id: 1,
      name: "Complete Blood Count (CBC)",
      description: "Comprehensive blood analysis including RBC, WBC, platelets",
      price: "₦14,000",
      duration: "24 hours",
      preparation: "No fasting required",
      image: Images.placeholder,
    },
    {
      id: 2,
      name: "Liver Function Test",
      description: "Comprehensive liver enzyme analysis",
      price: "₦10,000",
      duration: "24 hours",
      preparation: "8 hours fasting required",
      image: Images.placeholder,
    },
    {
      id: 3,
      name: "Lipid Profile",
      description: "Cholesterol and triglyceride analysis",
      price: "₦8,000",
      duration: "24 hours",
      preparation: "12 hours fasting required",
      image: Images.placeholder,
    },
  ];

  const recentResults = [
    {
      id: 1,
      testName: "Complete Blood Count",
      doctor: "Dr. Sarah Olukoya",
      date: "Sep 25th, 2025 • 12:00 PM",
      status: "Normal",
      statusColor: "#27AE60",
    },
    {
      id: 2,
      testName: "Lipid Profile",
      doctor: "Dr. Femi Johnson",
      date: "Sep 25th, 2025 • 12:00 PM",
      status: "Attention Required",
      statusColor: "#E74C3C",
    },
  ];

  const handleBookTest = (test) => {
    navigation.navigate("BookLabTest", { test });
  };

  const handleViewResults = () => {
    navigation.navigate("LabResults");
  };

  const handleMyResults = () => {
    navigation.navigate("LabResults");
  };

  const handleLabCenters = () => {
    // Navigate to lab centers screen
    console.log("Navigate to lab centers");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lab Test</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <CategoryFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search for doctors or specialties"
        />

        <FeatureCards
          onMyResults={handleMyResults}
          onLabCenters={handleLabCenters}
        />

        <PopularTestsSection
          tests={popularTests}
          onBookTest={handleBookTest}
          onViewAll={handleViewResults}
        />

        <RecentResultsSection
          results={recentResults}
          onViewAll={handleViewResults}
        />
      </ScrollView>
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
  content: {
    flex: 1,
  },
  categoriesContainer: {
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
  },
  categoryButton: {
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.sm,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginRight: Sizes.sm,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
  },
  selectedCategoryButtonText: {
    color: Colors.white,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    marginHorizontal: Sizes.lg,
    marginBottom: Sizes.lg,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchInput: {
    flex: 1,
    marginLeft: Sizes.sm,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.textPrimary,
  },
  featureCards: {
    flexDirection: "row",
    paddingHorizontal: Sizes.lg,
    marginBottom: Sizes.lg,
  },
  featureCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.lg,
    marginHorizontal: Sizes.xs,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  featureDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
  section: {
    paddingHorizontal: Sizes.lg,
    marginBottom: Sizes.xl,
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
    color: Colors.primary,
  },
  testCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.lg,
    marginBottom: Sizes.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testHeader: {
    marginBottom: Sizes.md,
  },
  testInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  testIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  testDuration: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    marginLeft: Sizes.xs,
  },
  testPreparation: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    marginLeft: Sizes.xs,
  },
  testContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  testImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: Sizes.md,
  },
  testDetails: {
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
    lineHeight: 16,
  },
  testPrice: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: Sizes.sm,
    alignItems: "center",
  },
  bookButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
  resultCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.lg,
    marginBottom: Sizes.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultDate: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
  },
  resultContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  resultInfo: {
    flex: 1,
  },
  resultTestName: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  resultDoctor: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  resultStatus: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    borderRadius: 12,
  },
  resultStatusText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
  viewResultButton: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    paddingVertical: Sizes.sm,
    alignItems: "center",
  },
  viewResultButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
  },
});

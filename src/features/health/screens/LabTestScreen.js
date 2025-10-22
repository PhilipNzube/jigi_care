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

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.selectedCategoryButton,
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === category.id && styles.selectedCategoryButtonText,
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  const renderTestCard = (test) => (
    <TouchableOpacity
      key={test.id}
      style={styles.testCard}
      onPress={() => handleBookTest(test)}
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

      <View style={styles.testContent}>
        <Image source={test.image} style={styles.testImage} />
        <View style={styles.testDetails}>
          <Text style={styles.testName}>{test.name}</Text>
          <Text style={styles.testDescription}>{test.description}</Text>
        </View>
        <Text style={styles.testPrice}>{test.price}</Text>
      </View>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => handleBookTest(test)}
      >
        <Text style={styles.bookButtonText}>Book Now</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderResultCard = (result) => (
    <View key={result.id} style={styles.resultCard}>
      <Text style={styles.resultDate}>{result.date}</Text>
      <View style={styles.resultContent}>
        <View style={styles.resultInfo}>
          <Text style={styles.resultTestName}>{result.testName}</Text>
          <Text style={styles.resultDoctor}>{result.doctor}</Text>
        </View>
        <View
          style={[styles.resultStatus, { backgroundColor: result.statusColor }]}
        >
          <Text style={styles.resultStatusText}>{result.status}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.viewResultButton}>
        <Text style={styles.viewResultButtonText}>View Result</Text>
      </TouchableOpacity>
    </View>
  );

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
        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map(renderCategoryButton)}
        </ScrollView>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for doctors or specialties"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        {/* Feature Cards */}
        <View style={styles.featureCards}>
          <TouchableOpacity
            style={styles.featureCard}
            onPress={handleMyResults}
          >
            <View style={styles.featureIcon}>
              <Ionicons name="document-text" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.featureTitle}>My Results</Text>
            <Text style={styles.featureDescription}>
              Check and review your laboratory results
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={handleLabCenters}
          >
            <View style={styles.featureIcon}>
              <Ionicons name="location" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.featureTitle}>Lab Centers</Text>
            <Text style={styles.featureDescription}>
              Locate nearby lab centers
            </Text>
          </TouchableOpacity>
        </View>

        {/* Popular Tests Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Tests</Text>
            <TouchableOpacity onPress={handleViewResults}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          {popularTests.map(renderTestCard)}
        </View>

        {/* Recent Results Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Results</Text>
            <TouchableOpacity onPress={handleViewResults}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          {recentResults.map(renderResultCard)}
        </View>
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
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    marginRight: Sizes.md,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
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

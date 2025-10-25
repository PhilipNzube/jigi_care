import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function CategoryFilters({
  categories,
  selectedCategory,
  onCategorySelect,
}) {
  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.selectedCategoryButton,
      ]}
      onPress={() => onCategorySelect(category.id)}
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

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {categories.map(renderCategoryButton)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.md,
  },
  contentContainer: {
    paddingHorizontal: Sizes.lg,
  },
  categoryButton: {
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.sm,
    marginRight: Sizes.sm,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
  },
  selectedCategoryButton: {
    backgroundColor: "#0098B3",
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
  },
  selectedCategoryButtonText: {
    color: Colors.white,
  },
});

import React, { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function SearchBar({
  searchQuery,
  onSearchChange,
  placeholder = "Search for doctors or specialties",
  editable = true,
}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <View style={styles.container}>
      <View
        style={[styles.searchBar, isSearchFocused && styles.searchBarFocused]}
      >
        <Ionicons name="search" size={20} color={Colors.grey} />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholderTextColor={Colors.grey}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          editable={editable}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Sizes.lg,
    marginBottom: Sizes.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 50,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.xs,
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
});

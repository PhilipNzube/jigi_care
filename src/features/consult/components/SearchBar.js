import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function SearchBar({ value, onChangeText }) {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons
          name="search"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for doctors or specialties"
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    backgroundColor: Colors.white,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
  },
  searchIcon: {
    marginRight: Sizes.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
  },
});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function SearchBar({ onPress }) {
  return (
    <View style={styles.searchContainer}>
      <TouchableOpacity style={styles.searchBar} onPress={onPress}>
        <Ionicons
          name="search"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <Text style={styles.searchPlaceholder}>Search for doctors or specialties</Text>
      </TouchableOpacity>
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
    borderRadius: 25,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
  },
  searchIcon: {
    marginRight: Sizes.sm,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#999",
  },
});

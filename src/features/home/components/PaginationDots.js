import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function PaginationDots({ totalDots, activeIndex, onDotPress }) {
  return (
    <View style={styles.paginationContainer}>
      {Array.from({ length: totalDots }, (_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.paginationDot,
            activeIndex === index && styles.activePaginationDot,
          ]}
          onPress={() => onDotPress(index)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Sizes.md,
    marginBottom: Sizes.lg,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#BDC3C7",
    marginHorizontal: 4,
  },
  activePaginationDot: {
    backgroundColor: Colors.white,
  },
});

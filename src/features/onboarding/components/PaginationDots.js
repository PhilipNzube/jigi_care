import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

const PaginationDots = ({ currentIndex, totalSlides }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSlides }, (_, index) => (
        <View
          key={index}
          style={[styles.dot, index === currentIndex && styles.activeDot]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 24,
  },
});

export default PaginationDots;

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Colors, Sizes } from "../constants";

export default function Card({
  children,
  style,
  onPress,
  shadow = true,
  padding = Sizes.lg,
}) {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[styles.card, shadow && styles.cardShadow, { padding }, style]}
      onPress={onPress}
    >
      {children}
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

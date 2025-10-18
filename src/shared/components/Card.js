import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors, Sizes } from "../constants";

const Card = ({
  children,
  style,
  padding = "md",
  margin = "sm",
  shadow = true,
  ...props
}) => {
  const cardStyle = [
    styles.card,
    styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
    styles[`margin${margin.charAt(0).toUpperCase() + margin.slice(1)}`],
    shadow && styles.shadow,
    style,
  ];

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Sizes.radius.lg,
  },

  // Padding variants
  paddingSm: {
    padding: Sizes.sm,
  },
  paddingMd: {
    padding: Sizes.md,
  },
  paddingLg: {
    padding: Sizes.lg,
  },

  // Margin variants
  marginSm: {
    margin: Sizes.sm,
  },
  marginMd: {
    margin: Sizes.md,
  },
  marginLg: {
    margin: Sizes.lg,
  },

  // Shadow
  shadow: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default Card;

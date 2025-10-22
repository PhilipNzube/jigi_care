import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function PaymentMethodCard({
  method,
  isSelected,
  onSelect,
  showDivider = false,
}) {
  const getIconName = (iconType) => {
    switch (iconType) {
      case "card":
        return "card-outline";
      case "bank":
        return "business-outline";
      case "phone":
        return "phone-portrait-outline";
      default:
        return "card-outline";
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.card, isSelected && styles.selectedCard]}
        onPress={onSelect}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getIconName(method.icon)}
              size={24}
              color={isSelected ? "#0098B3" : Colors.black}
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.title, isSelected && styles.selectedTitle]}>
              {method.title}
            </Text>
          </View>

          {isSelected && (
            <View style={styles.checkContainer}>
              <Ionicons name="checkmark-circle" size={20} color="#0098B3" />
            </View>
          )}
        </View>
      </TouchableOpacity>

      {showDivider && <View style={styles.divider} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    paddingVertical: Sizes.lg,
    paddingHorizontal: Sizes.md,
  },
  selectedCard: {
    backgroundColor: "#F0F9FF",
    borderLeftWidth: 3,
    borderLeftColor: "#0098B3",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: Sizes.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
  },
  selectedTitle: {
    color: "#0098B3",
    fontFamily: "Poppins-Bold",
  },
  checkContainer: {
    marginLeft: Sizes.sm,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginLeft: Sizes.xl,
  },
});

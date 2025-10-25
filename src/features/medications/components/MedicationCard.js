import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function MedicationCard({ medication, onAddToCart }) {
  const isOutOfStock = medication.status === "Out of Stock";

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton}>
        <Ionicons name="ellipsis-horizontal" size={16} color={Colors.grey} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.medicationInfo}>
          <View style={styles.medicationImage}>
            <Ionicons name="medical" size={24} color={Colors.white} />
          </View>

          <View style={styles.medicationDetails}>
            <View style={styles.nameAndStatus}>
              <Text style={styles.medicationName}>{medication.name}</Text>
              <View
                style={[
                  styles.statusTag,
                  { backgroundColor: medication.statusColor },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: isOutOfStock ? "#F44336" : Colors.white },
                  ]}
                >
                  {medication.status}
                </Text>
              </View>
            </View>

            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.rating}>{medication.rating}</Text>
            </View>

            <Text style={styles.dosage}>{medication.dosage}</Text>
            <Text style={styles.description}>{medication.description}</Text>
            <Text style={styles.price}>
              ₦{medication.price.toLocaleString()}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.addToCartButton,
            isOutOfStock && styles.disabledButton,
          ]}
          onPress={onAddToCart}
          disabled={isOutOfStock}
        >
          <Text
            style={[styles.addToCartText, isOutOfStock && styles.disabledText]}
          >
            Add to cart
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.md,
    marginBottom: Sizes.md,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButton: {
    position: "absolute",
    top: Sizes.sm,
    left: Sizes.sm,
    zIndex: 1,
  },
  content: {
    marginTop: Sizes.sm,
  },
  medicationInfo: {
    flexDirection: "row",
    marginBottom: Sizes.md,
  },
  medicationImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#0098B3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.sm,
  },
  medicationDetails: {
    flex: 1,
  },
  nameAndStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.xs,
  },
  medicationName: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    flex: 1,
  },
  statusTag: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.xs,
  },
  rating: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.grey,
    marginLeft: 4,
  },
  dosage: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    marginBottom: Sizes.xs,
  },
  price: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  addToCartButton: {
    backgroundColor: "#0098B3",
    paddingVertical: Sizes.sm,
    paddingHorizontal: Sizes.md,
    borderRadius: 20,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#B0B0B0",
  },
  addToCartText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "Poppins-Bold",
  },
  disabledText: {
    color: "#808080",
  },
});




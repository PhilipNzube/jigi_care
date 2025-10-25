import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function CartItem({ item }) {
  const handleDelete = () => {
    // Handle delete logic
  };

  const handleDecreaseQuantity = () => {
    // Handle decrease quantity logic
  };

  const handleIncreaseQuantity = () => {
    // Handle increase quantity logic
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton}>
        <Ionicons name="ellipsis-horizontal" size={16} color={Colors.grey} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Ionicons name="trash" size={20} color="#F44336" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.medicationInfo}>
          <View style={styles.medicationImage}>
            <Ionicons name="medical" size={24} color={Colors.white} />
          </View>

          <View style={styles.medicationDetails}>
            <Text style={styles.medicationName}>{item.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.rating}>{item.rating}</Text>
            </View>
            <Text style={styles.dosage}>{item.dosage}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.price}>₦{item.price.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleDecreaseQuantity}
          >
            <Ionicons name="remove" size={16} color={Colors.grey} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleIncreaseQuantity}
          >
            <Ionicons name="add" size={16} color={Colors.grey} />
          </TouchableOpacity>
        </View>
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
  deleteButton: {
    position: "absolute",
    top: Sizes.sm,
    right: Sizes.sm,
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
  medicationName: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: Sizes.xs,
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
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  quantity: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginHorizontal: Sizes.md,
    minWidth: 20,
    textAlign: "center",
  },
});





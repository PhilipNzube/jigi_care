import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import { getCart, updateCart } from "../services/medicationService";
import { showError, showSuccess } from "../../../shared/utils/toast";

export default function CartItem({ item, onQuantityChange }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity || 1);

  useEffect(() => {
    setQuantity(item.quantity || 1);
  }, [item.quantity]);

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    // TODO: Implement delete item from cart
    if (onQuantityChange) {
      onQuantityChange();
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleDecreaseQuantity = async () => {
    if (quantity <= 1) return;
    
    try {
      setIsUpdating(true);
      const newQuantity = quantity - 1;
      
      // Get current cart
      const cartData = await getCart();
      const updatedItems = cartData.items.map((cartItem) => {
        if (cartItem.medicationId === item.medicationId) {
          return { ...cartItem, quantity: newQuantity };
        }
        return cartItem;
      });

      await updateCart(updatedItems);
      setQuantity(newQuantity);
      
      if (onQuantityChange) {
        onQuantityChange();
      }
    } catch (error) {
      console.error("❌ [CART ITEM] Error decreasing quantity:", error);
      showError("Failed to update quantity");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncreaseQuantity = async () => {
    try {
      setIsUpdating(true);
      const newQuantity = quantity + 1;
      
      // Get current cart
      const cartData = await getCart();
      const updatedItems = cartData.items.map((cartItem) => {
        if (cartItem.medicationId === item.medicationId) {
          return { ...cartItem, quantity: newQuantity };
        }
        return cartItem;
      });

      await updateCart(updatedItems);
      setQuantity(newQuantity);
      
      if (onQuantityChange) {
        onQuantityChange();
      }
    } catch (error) {
      console.error("❌ [CART ITEM] Error increasing quantity:", error);
      showError("Failed to update quantity");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#EBEBEB" />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.itemHeader}>
            <View style={styles.itemInfo}>
              <Image source={Images.placeholder} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <View style={styles.nameRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.rating}>{item.rating}</Text>
                  </View>
                </View>
                <Text style={styles.dosage}>{item.dosage}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash" size={18} color="#F44336" />
            </TouchableOpacity>
          </View>

          <View style={styles.itemFooter}>
            <Text style={styles.price}>₦{item.price.toLocaleString()}</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity <= 1 && styles.quantityButtonDisabled,
                ]}
                onPress={handleDecreaseQuantity}
                disabled={quantity <= 1 || isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color={Colors.grey} />
                ) : (
                  <Ionicons
                    name="remove"
                    size={16}
                    color={quantity <= 1 ? Colors.lightGray : Colors.grey}
                  />
                )}
              </TouchableOpacity>
              <Text style={styles.quantity}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleIncreaseQuantity}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color={Colors.grey} />
                ) : (
                  <Ionicons name="add" size={16} color={Colors.grey} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="trash-outline" size={40} color="#F44336" />
            </View>
            <Text style={styles.modalTitle}>Clear Cart?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelDelete}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.confirmButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.sm,
    marginBottom: Sizes.md,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  menuButton: {
    marginLeft: Sizes.sm,
  },
  content: {
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    padding: Sizes.md,
    marginTop: Sizes.sm,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Sizes.md,
  },
  itemInfo: {
    flexDirection: "row",
    flex: 1,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
    marginRight: Sizes.sm,
  },
  itemDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.xs,
  },
  itemName: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginRight: Sizes.xs,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    marginLeft: 2,
  },
  dosage: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#5B6B62",
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#5B6B62",
  },
  deleteButton: {
    padding: Sizes.xs,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonDisabled: {
    backgroundColor: "#F5F5F5",
    opacity: 0.5,
  },
  quantity: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginHorizontal: Sizes.md,
    minWidth: 20,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Sizes.xl,
    width: "80%",
    alignItems: "center",
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: "#F4433610",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginBottom: Sizes.xl,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Sizes.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 30,
    paddingVertical: Sizes.md,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#F44336",
    borderRadius: 30,
    paddingVertical: Sizes.md,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
});

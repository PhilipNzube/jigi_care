import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import {
  updateCartItemQuantity,
  deleteCartItem,
} from "../services/medicationService";
import { showError, showSuccess } from "../../../shared/utils/toast";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function CartItem({ item, onQuantityChange, onItemDeleted }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity || 1);
  const [isDeleting, setIsDeleting] = useState(false);

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Debounce timer ref
  const debounceTimerRef = useRef(null);
  const pendingQuantityRef = useRef(quantity);

  useEffect(() => {
    setQuantity(item.quantity || 1);
    pendingQuantityRef.current = item.quantity || 1;
  }, [item.quantity]);

  // Debounced API call for quantity updates
  const debouncedUpdateQuantity = async (newQuantity) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        if (newQuantity <= 0) {
          // Delete item if quantity is 0
          await handleDeleteItem();
        } else {
          // Update quantity via PATCH API
          await updateCartItemQuantity(item.medicationId, newQuantity);

          if (onQuantityChange) {
            onQuantityChange();
          }
        }
      } catch (error) {
        console.error("❌ [CART ITEM] Error updating quantity:", error);
        showError("Unable to update quantity. Please try again.");
        // Revert to previous quantity on error
        setQuantity(pendingQuantityRef.current);
      }
    }, 500); // 500ms debounce
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    await handleDeleteItem();
  };

  const handleDeleteItem = async () => {
    if (isDeleting) return;

    setIsDeleting(true);

    // Animate slide away
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      try {
        await deleteCartItem(item.medicationId);

        if (onItemDeleted) {
          onItemDeleted(item.medicationId);
        }

        if (onQuantityChange) {
          onQuantityChange();
        }
      } catch (error) {
        console.error("❌ [CART ITEM] Error deleting item:", error);
        showError("Unable to remove item. Please try again.");
        // Reset animation on error
        slideAnim.setValue(0);
        opacityAnim.setValue(1);
        setIsDeleting(false);
      }
    });
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleDecreaseQuantity = () => {
    const newQuantity = Math.max(0, quantity - 1);
    setQuantity(newQuantity);
    pendingQuantityRef.current = newQuantity;

    if (newQuantity === 0) {
      // Delete item if quantity reaches 0
      handleDeleteItem();
    } else {
      // Debounce API call
      debouncedUpdateQuantity(newQuantity);
    }
  };

  const handleIncreaseQuantity = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    pendingQuantityRef.current = newQuantity;

    // Debounce API call
    debouncedUpdateQuantity(newQuantity);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateX: slideAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
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
              disabled={isDeleting}
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
                  quantity === 0 && styles.quantityButtonDisabled,
                ]}
                onPress={handleDecreaseQuantity}
                disabled={isDeleting}
              >
                <Ionicons
                  name="remove"
                  size={16}
                  color={quantity === 0 ? Colors.lightGray : Colors.grey}
                />
              </TouchableOpacity>
              <Text style={styles.quantity}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleIncreaseQuantity}
                disabled={isDeleting}
              >
                <Ionicons name="add" size={16} color={Colors.grey} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>

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
            <Text style={styles.modalTitle}>Remove Item?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to remove this item from your cart?
            </Text>
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
                <Text style={styles.confirmButtonText}>Yes, Remove</Text>
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
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginBottom: Sizes.sm,
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    textAlign: "center",
    marginBottom: Sizes.xl,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Sizes.md,
    width: "100%",
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

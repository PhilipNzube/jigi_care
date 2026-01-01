import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import CartItem from "../components/CartItem";
import ClearCartModal from "../modals/ClearCartModal";
import { getCart, getMedicationById } from "../services/medicationService";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";
import EmptyState from "../../../shared/components/EmptyState";

export default function CartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [showClearModal, setShowClearModal] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCartData = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }
      const cartData = await getCart();
      
      if (!cartData.items || cartData.items.length === 0) {
        setCartItems([]);
        return;
      }

      // Fetch medication details for each item
      const itemsWithDetails = await Promise.all(
        cartData.items.map(async (item) => {
          try {
            const medication = await getMedicationById(item.medicationId);
            if (medication) {
              return {
                id: medication.id,
                medicationId: item.medicationId,
                name: medication.name,
                rating: medication.rating || 0,
                dosage: `${medication.gram}mg`,
                description: medication.description || "",
                price: medication.price || 0,
                quantity: item.quantity,
              };
            }
            return null;
          } catch (error) {
            console.error(`❌ [CART SCREEN] Error fetching medication ${item.medicationId}:`, error);
            return null;
          }
        })
      );

      setCartItems(itemsWithDetails.filter((item) => item !== null));
    } catch (error) {
      console.error("❌ [CART SCREEN] Error fetching cart:", error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCartData();
  }, [fetchCartData]);

  useFocusEffect(
    useCallback(() => {
      fetchCartData(true);
    }, [fetchCartData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCartData(true);
  }, [fetchCartData]);

  const handleCartUpdate = useCallback(() => {
    fetchCartData(true);
  }, [fetchCartData]);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleClearCart = () => {
    setShowClearModal(true);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigation.navigate("ShippingAddress");
  };

  const handleClearCartConfirm = () => {
    setShowClearModal(false);
    // TODO: Implement clear cart API call
    setCartItems([]);
  };

  // Cart Item Skeleton Component
  const CartItemSkeleton = () => (
    <ShimmerLoader>
      <View style={styles.skeletonCartItem}>
        <View style={styles.skeletonCartContent}>
          <View style={styles.skeletonCartHeader}>
            <View style={styles.skeletonCartInfo}>
              <View style={styles.skeletonCartImage} />
              <View style={styles.skeletonCartDetails}>
                <View style={styles.skeletonCartNameRow} />
                <View style={styles.skeletonCartDosage} />
                <View style={styles.skeletonCartDescription} />
              </View>
            </View>
            <View style={styles.skeletonDeleteButton} />
          </View>
          <View style={styles.skeletonCartFooter}>
            <View style={styles.skeletonPrice} />
            <View style={styles.skeletonQuantityControls}>
              <View style={styles.skeletonQuantityButton} />
              <View style={styles.skeletonQuantity} />
              <View style={styles.skeletonQuantityButton} />
            </View>
          </View>
        </View>
      </View>
    </ShimmerLoader>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.grey} />
          </TouchableOpacity>
          <Text style={styles.title}>Cart</Text>
          <View style={{ width: 50 }} />
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <CartItemSkeleton />
          <CartItemSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.grey} />
        </TouchableOpacity>
        <Text style={styles.title}>Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
        {cartItems.length === 0 && <View style={{ width: 50 }} />}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {cartItems.length === 0 ? (
          <EmptyState
            icon="cart-outline"
            title="Your cart is empty"
            message="Add medications to your cart to get started"
          />
        ) : (
          <>
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={handleCartUpdate}
              />
            ))}

            <View style={styles.paymentSummary}>
              <Text style={styles.summaryTitle}>Payment Summary</Text>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₦{total.toLocaleString()}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            { marginBottom: insets.bottom + Sizes.lg },
          ]}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      )}

      <ClearCartModal
        visible={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearCartConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    backgroundColor: "#F5F5F5",
  },
  backButton: {
    padding: Sizes.xs,
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
  },
  clearText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#F44336",
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.md,
  },
  paymentSummary: {
    marginVertical: Sizes.lg,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginBottom: Sizes.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Sizes.sm,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: Sizes.sm,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
  },
  totalValue: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
  },
  checkoutButton: {
    backgroundColor: "#0098B3",
    marginHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    borderRadius: 30,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
  },
  skeletonCartItem: {
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
  skeletonCartContent: {
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    padding: Sizes.md,
    marginTop: Sizes.sm,
  },
  skeletonCartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Sizes.md,
  },
  skeletonCartInfo: {
    flexDirection: "row",
    flex: 1,
  },
  skeletonCartImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
    marginRight: Sizes.sm,
  },
  skeletonCartDetails: {
    flex: 1,
  },
  skeletonCartNameRow: {
    width: "70%",
    height: 16,
    borderRadius: 4,
    marginBottom: Sizes.xs,
  },
  skeletonCartDosage: {
    width: "50%",
    height: 12,
    borderRadius: 4,
    marginBottom: 2,
  },
  skeletonCartDescription: {
    width: "90%",
    height: 12,
    borderRadius: 4,
  },
  skeletonDeleteButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  skeletonCartFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skeletonPrice: {
    width: 80,
    height: 16,
    borderRadius: 4,
  },
  skeletonQuantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: Sizes.md,
  },
  skeletonQuantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  skeletonQuantity: {
    width: 20,
    height: 16,
    borderRadius: 4,
  },
});

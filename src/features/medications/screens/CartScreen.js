import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";
import CartItem from "../components/CartItem";
import ClearCartModal from "../modals/ClearCartModal";

export default function CartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [showClearModal, setShowClearModal] = useState(false);

  const cartItems = [
    {
      id: 1,
      name: "Acetaminophen",
      rating: 4.6,
      dosage: "500mg",
      description: "Pain reliever and fever reducer",
      price: 5200,
      quantity: 1,
      image: "acetaminophen",
    },
    {
      id: 2,
      name: "Omega-3",
      rating: 4.6,
      dosage: "1000mg",
      description: "Fish oil supplement for heart health",
      price: 3100,
      quantity: 1,
      image: "omega3",
    },
  ];

  const consultationFee = 4000;
  const additionalFee = 500;
  const total =
    consultationFee +
    additionalFee +
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleClearCart = () => {
    setShowClearModal(true);
  };

  const handleCheckout = () => {
    navigation.navigate("ShippingAddress");
  };

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
        <TouchableOpacity onPress={handleClearCart}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {cartItems.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}

        <View style={styles.paymentSummary}>
          <Text style={styles.summaryTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Consultation Fee</Text>
            <Text style={styles.summaryValue}>
              ₦{consultationFee.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Additional Fee</Text>
            <Text style={styles.summaryValue}>
              ₦{additionalFee.toLocaleString()}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₦{total.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
        <Text style={styles.checkoutButtonText}>Checkout</Text>
      </TouchableOpacity>

      <ClearCartModal
        visible={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={() => {
          setShowClearModal(false);
          // Handle clear cart logic
        }}
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
    backgroundColor: Colors.white,
  },
  backButton: {
    padding: Sizes.xs,
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
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
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.lg,
    marginVertical: Sizes.lg,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
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
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  totalValue: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  checkoutButton: {
    backgroundColor: "#0098B3",
    marginHorizontal: Sizes.lg,
    marginBottom: Sizes.lg,
    paddingVertical: Sizes.md,
    borderRadius: 25,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
});

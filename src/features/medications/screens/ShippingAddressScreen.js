import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";

export default function ShippingAddressScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const handleProcessToPayment = () => {
    // Navigate to payment screen
    navigation.navigate("PaymentMethod");
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
        <Text style={styles.title}>Shipping Address</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.addressSection}>
          <Text style={styles.sectionLabel}>Home Address</Text>
          <View style={styles.addressContainer}>
            <Ionicons name="location" size={20} color={Colors.grey} />
            <Text style={styles.addressText}>423 Jakande Estate</Text>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={16} color={Colors.grey} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.processButton}
        onPress={handleProcessToPayment}
      >
        <Text style={styles.processButtonText}>Process to Payment</Text>
      </TouchableOpacity>
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
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    backgroundColor: Colors.white,
  },
  backButton: {
    padding: Sizes.xs,
    marginRight: Sizes.sm,
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.xl,
  },
  addressSection: {
    marginBottom: Sizes.xl,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.grey,
    marginBottom: Sizes.sm,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    marginLeft: Sizes.sm,
  },
  editButton: {
    padding: Sizes.xs,
  },
  processButton: {
    backgroundColor: "#0098B3",
    marginHorizontal: Sizes.lg,
    marginBottom: Sizes.lg,
    paddingVertical: Sizes.md,
    borderRadius: 25,
    alignItems: "center",
  },
  processButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
});







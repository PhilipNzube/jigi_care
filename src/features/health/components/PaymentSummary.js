import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function PaymentSummary({
  testPrice,
  collectionType,
  homeCollectionFee,
  totalAmount,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Payment Summary</Text>
      <View style={styles.summaryCard}>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Consultation Fee</Text>
          <Text style={styles.paymentValue}>{testPrice}</Text>
        </View>
        {collectionType === "home" && (
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Home Collection</Text>
            <Text style={styles.paymentValue}>
              ₦{homeCollectionFee.toLocaleString()}
            </Text>
          </View>
        )}
        <View style={styles.paymentDivider} />
        <View style={styles.paymentRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₦{totalAmount.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  paymentLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  paymentValue: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
  },
  paymentDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: Sizes.sm,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
  },
});

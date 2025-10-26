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
      <View style={styles.paymentRow}>
        <Text style={styles.paymentLabel}>Test Fee</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginBottom: Sizes.md,
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
    color: "#666",
  },
  paymentValue: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
  },
  paymentDivider: {
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
});

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function PaymentSummarySection({ doctor }) {
  const consultationFee = 4000;
  const serviceFee = 500;
  const total = consultationFee + serviceFee;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Summary</Text>

      <View style={styles.feeRow}>
        <Text style={styles.feeLabel}>Consultation Fee</Text>
        <Text style={styles.feeAmount}>
          ₦{consultationFee.toLocaleString()}
        </Text>
      </View>

      <View style={styles.feeRow}>
        <Text style={styles.feeLabel}>Service Fee</Text>
        <Text style={styles.feeAmount}>₦{serviceFee.toLocaleString()}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>₦{total.toLocaleString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.xl,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginBottom: Sizes.md,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  feeLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
  },
  feeAmount: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: Sizes.sm,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  totalAmount: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
});

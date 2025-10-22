import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function PaymentFooter({ onCancel }) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Ionicons name="close" size={16} color="#666" />
        <Text style={styles.cancelText}>Cancel Payment</Text>
      </TouchableOpacity>

      <View style={styles.securityContainer}>
        <Ionicons name="lock-closed" size={16} color="#666" />
        <Text style={styles.securityText}>Secured by Paystack</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: "center",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  cancelText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
    marginLeft: Sizes.xs,
  },
  securityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  securityText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#666",
    marginLeft: Sizes.xs,
  },
});

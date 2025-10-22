import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

export default function PaymentHeader({
  title,
  onBackPress,
  amount,
  style,
  showContentArea = true,
}) {
  return (
    <View style={[styles.container, style]}>
      {/* Dark Grey Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Ionicons name="chevron-back" size={20} color={Colors.black} />
        </TouchableOpacity>

        <Text style={styles.title}>{title}</Text>

        <View style={styles.placeholder} />
      </View>

      {/* White Content Area */}
      {showContentArea && amount && (
        <View style={styles.contentArea}>
          <View style={styles.logoContainer}>
            <Image source={Images.appIcon} style={styles.logoImage} />
          </View>

          <View style={styles.paymentDetails}>
            <Text style={styles.email}>timilehinabodunrin@gma...</Text>
            <Text style={styles.amount}>
              Pay <Text style={styles.amountValue}>{amount}</Text>
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.lg,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 32,
  },
  contentArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.lg,
    backgroundColor: Colors.white,
  },
  logoContainer: {
    marginRight: Sizes.md,
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  paymentDetails: {
    alignItems: "flex-end",
  },
  email: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
    marginBottom: Sizes.xs,
  },
  amount: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
  },
  amountValue: {
    fontFamily: "Poppins-Bold",
    color: "#0098B3",
  },
});

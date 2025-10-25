import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";

export default function OrderDetailsModal({ visible, onClose, order }) {
  const insets = useSafeAreaInsets();

  const handleReorder = () => {
    // Handle reorder logic
    onClose();
  };

  const handleDownloadReceipt = () => {
    // Handle download receipt logic
  };

  if (!order) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />
        <View style={[styles.modal, { paddingBottom: insets.bottom }]}>
          <View style={styles.header}>
            <Text style={styles.title}>ORDER DETAILS</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.grey} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.orderInfo}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{order.id}</Text>
                <View
                  style={[
                    styles.statusTag,
                    { backgroundColor: order.statusColor },
                  ]}
                >
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Order Date:</Text>
                <Text style={styles.infoValue}>{order.date}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Delivery Date:</Text>
                <Text style={styles.infoValue}>Sep 27th, 2025 • 12:43 AM</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tracking ID:</Text>
                <Text style={[styles.infoValue, styles.trackingLink]}>
                  {order.trackingId}
                </Text>
              </View>
            </View>

            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>Items:</Text>
              {order.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.itemName}>
                    {item.name} (x{item.quantity})
                  </Text>
                  <Text style={styles.itemPrice}>
                    ₦{item.price.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.addressSection}>
              <Text style={styles.sectionTitle}>Shipping Address:</Text>
              <View style={styles.addressRow}>
                <Ionicons name="location" size={16} color={Colors.grey} />
                <Text style={styles.addressText}>432 Jakande Estate</Text>
              </View>
            </View>

            <View style={styles.paymentSection}>
              <Text style={styles.sectionTitle}>Payment Summary</Text>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Sub Total</Text>
                <Text style={styles.paymentValue}>₦10,000</Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Delivery Fee</Text>
                <Text style={styles.paymentValue}>₦0</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.paymentRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₦10,000</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.reorderButton}
              onPress={handleReorder}
            >
              <Text style={styles.reorderButtonText}>Reorder</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleDownloadReceipt}
            >
              <Text style={styles.downloadButtonText}>Download Receipt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  overlayTouchable: {
    flex: 1,
  },
  modal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Sizes.lg,
    paddingHorizontal: Sizes.lg,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.grey,
  },
  closeButton: {
    padding: Sizes.xs,
  },
  content: {
    flex: 1,
  },
  orderInfo: {
    marginBottom: Sizes.lg,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  orderId: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  statusTag: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Sizes.sm,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
  },
  trackingLink: {
    color: "#0098B3",
    textDecorationLine: "underline",
  },
  itemsSection: {
    marginBottom: Sizes.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: Sizes.sm,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Sizes.xs,
  },
  itemName: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
  },
  addressSection: {
    marginBottom: Sizes.lg,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    marginLeft: Sizes.xs,
  },
  paymentSection: {
    marginBottom: Sizes.lg,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Sizes.sm,
  },
  paymentLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
  },
  paymentValue: {
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
  actionButtons: {
    paddingTop: Sizes.lg,
  },
  reorderButton: {
    backgroundColor: "#0098B3",
    paddingVertical: Sizes.md,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  reorderButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  downloadButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#0098B3",
    paddingVertical: Sizes.md,
    borderRadius: 25,
    alignItems: "center",
  },
  downloadButtonText: {
    color: "#0098B3",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
});




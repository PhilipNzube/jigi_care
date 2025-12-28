import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Sizes } from "../../../shared/constants";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function OrderDetailsModal({ visible, onClose, order }) {
  const insets = useSafeAreaInsets();

  const getStatusTextColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "#4CAF50"; // Green
      case "in transit":
      case "shipped":
        return "#FF9800"; // Orange
      case "processing":
      case "pending":
        return "#2196F3"; // Blue
      case "cancelled":
        return "#F44336"; // Red
      default:
        return Colors.white;
    }
  };

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

          <View style={styles.scrollContainer}>
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
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
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusTextColor(order.status) },
                      ]}
                    >
                      {order.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Order Date:</Text>
                  <Text style={styles.infoValue}>{order.date}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Delivery Date:</Text>
                  <Text style={styles.infoValue}>
                    {order.deliveryDate || order.deliveredDate || "N/A"}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tracking ID:</Text>
                  <Text style={[styles.infoValue, styles.trackingLink]}>
                    {order.trackingId || order.reference || order.id}
                  </Text>
                </View>
              </View>

              <View style={styles.itemsSection}>
                <Text style={styles.sectionTitle}>Items:</Text>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <Text style={styles.itemName}>
                        {item.name} {item.gram ? `(${item.gram})` : ""} (x
                        {item.quantity || 1})
                      </Text>
                      <Text style={styles.itemPrice}>
                        ₦{(item.price || 0).toLocaleString()}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noItemsText}>No items found</Text>
                )}
              </View>

              <View style={styles.addressSection}>
                <Text style={styles.sectionTitle}>Shipping Address:</Text>
                <View style={styles.addressRow}>
                  <Ionicons name="location" size={16} color={Colors.grey} />
                  <Text style={styles.addressText}>
                    {order.shippingAddress ||
                      order.address ||
                      order.orderData?.shippingAddress ||
                      order.orderData?.address ||
                      "Address not available"}
                  </Text>
                </View>
              </View>

              <View style={styles.paymentSection}>
                <Text style={styles.sectionTitle}>Payment Summary</Text>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Sub Total</Text>
                  <Text style={styles.paymentValue}>
                    ₦
                    {(
                      (order.total || order.totalAmount || 0) -
                      (order.deliveryFee || 0)
                    ).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Delivery Fee</Text>
                  <Text style={styles.paymentValue}>
                    ₦{(order.deliveryFee || 0).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.paymentRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    ₦{(order.total || order.totalAmount || 0).toLocaleString()}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>

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
    height: SCREEN_HEIGHT * 0.85,
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Sizes.lg,
    position: "relative",
    minHeight: 30,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.grey,
  },
  closeButton: {
    padding: Sizes.xs,
    position: "absolute",
    right: 0,
  },
  scrollContainer: {
    flex: 1,
    minHeight: 0,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: Sizes.lg,
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
    fontFamily: "Poppins-Medium",
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
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Sizes.sm,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666666",
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
  },
  trackingLink: {
    color: "#0098B3",
  },
  itemsSection: {
    marginBottom: Sizes.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
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
    color: "#666666",
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
  },
  noItemsText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    fontStyle: "italic",
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
    color: "#666666",
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
    color: "#666666",
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

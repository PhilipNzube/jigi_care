import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function OrderHistoryCard({ order, navigation }) {
  const handleViewDetails = () => {
    // For now, we'll just show an alert since OrderDetailsModal is a modal
    // In a real app, you might want to pass the order data differently
    console.log("View details for order:", order.id);
  };

  const handleReorder = () => {
    // Handle reorder logic
  };

  const handleTrackOrder = () => {
    // Handle track order logic
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton}>
        <Ionicons name="ellipsis-horizontal" size={16} color={Colors.grey} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>Order #{order.id}</Text>
            <Text style={styles.orderDate}>{order.date}</Text>
            <Text style={styles.trackingId}>
              Tracking ID: {order.trackingId}
            </Text>
          </View>
          <View
            style={[styles.statusTag, { backgroundColor: order.statusColor }]}
          >
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </View>

        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>Items:</Text>
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

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={handleViewDetails}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>

          {order.status === "Delivered" ? (
            <TouchableOpacity
              style={styles.reorderButton}
              onPress={handleReorder}
            >
              <Text style={styles.reorderText}>Reorder</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.trackButton}
              onPress={handleTrackOrder}
            >
              <Text style={styles.trackText}>Track Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.md,
    marginBottom: Sizes.md,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButton: {
    position: "absolute",
    top: Sizes.sm,
    left: Sizes.sm,
    zIndex: 1,
  },
  content: {
    marginTop: Sizes.sm,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Sizes.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    marginBottom: 2,
  },
  trackingId: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
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
  itemsSection: {
    marginBottom: Sizes.md,
  },
  itemsTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: Sizes.sm,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
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
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  viewDetailsButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#0098B3",
    paddingVertical: Sizes.sm,
    paddingHorizontal: Sizes.md,
    borderRadius: 20,
    alignItems: "center",
    marginRight: Sizes.sm,
  },
  viewDetailsText: {
    color: "#0098B3",
    fontSize: 14,
    fontFamily: "Poppins-Bold",
  },
  reorderButton: {
    flex: 1,
    backgroundColor: "#0098B3",
    paddingVertical: Sizes.sm,
    paddingHorizontal: Sizes.md,
    borderRadius: 20,
    alignItems: "center",
  },
  reorderText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "Poppins-Bold",
  },
  trackButton: {
    flex: 1,
    backgroundColor: "#0098B3",
    paddingVertical: Sizes.sm,
    paddingHorizontal: Sizes.md,
    borderRadius: 20,
    alignItems: "center",
  },
  trackText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "Poppins-Bold",
  },
});

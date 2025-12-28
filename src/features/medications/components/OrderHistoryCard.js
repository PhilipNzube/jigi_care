import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function OrderHistoryCard({ order, navigation, onViewDetails }) {
  const getStatusTextColor = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "#4CAF50"; // Green
      case "in transit":
        return "#FF9800"; // Orange
      case "processing":
        return "#2196F3"; // Blue
      case "cancelled":
        return "#F44336"; // Red
      default:
        return Colors.white;
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(order);
    }
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
        <Ionicons name="ellipsis-horizontal" size={20} color="#EBEBEB" />
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
    padding: Sizes.sm,
    marginBottom: Sizes.md,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  menuButton: {
    marginLeft: Sizes.sm,
  },
  content: {
    padding: Sizes.md,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
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
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#5B6B62",
    marginBottom: 2,
  },
  trackingId: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#5B6B62",
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
  itemsSection: {
    marginBottom: Sizes.md,
  },
  itemsTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginBottom: Sizes.sm,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemName: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#5B6B62",
    flex: 1,
  },
  itemPrice: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#5B6B62",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  viewDetailsButton: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingVertical: Sizes.sm,
    paddingHorizontal: Sizes.md,
    borderRadius: 20,
    alignItems: "center",
    marginRight: Sizes.sm,
  },
  viewDetailsText: {
    color: "#0098B3",
    fontSize: 14,
    fontFamily: "Poppins-Medium",
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
    fontFamily: "Poppins-Medium",
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

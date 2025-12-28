import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import OrderHistoryCard from "./OrderHistoryCard";
import OrderDetailsModal from "../modals/OrderDetailsModal";
import { getUserOrders } from "../services/medicationService";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";
import EmptyState from "../../../shared/components/EmptyState";
import { format } from "date-fns";

// Order History Card Skeleton Component
function OrderHistoryCardSkeleton() {
  return (
    <ShimmerLoader>
      <View style={skeletonStyles.skeletonCard}>
        <View style={skeletonStyles.skeletonContent}>
          <View style={skeletonStyles.skeletonHeader}>
            <View style={skeletonStyles.skeletonOrderId} />
            <View style={skeletonStyles.skeletonStatus} />
          </View>
          <View style={skeletonStyles.skeletonDate} />
          <View style={skeletonStyles.skeletonTrackingId} />
          <View style={skeletonStyles.skeletonItems}>
            <View style={skeletonStyles.skeletonItem} />
            <View style={skeletonStyles.skeletonItem} />
          </View>
          <View style={skeletonStyles.skeletonTotal} />
        </View>
      </View>
    </ShimmerLoader>
  );
}

export default function HistoryTab({ navigation }) {
  // Search box commented out as requested
  // const [searchQuery, setSearchQuery] = useState("");
  // const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const ordersData = await getUserOrders();
      
      // Map API response to card format
      const mappedOrders = ordersData.map((order) => {
        const orderDate = new Date(order.orderDate || order.createdAt);
        const formattedDate = format(orderDate, "MMM dd, yyyy • h:mm a");
        
        // Format delivery date if available
        let deliveryDate = null;
        if (order.deliveryDate || order.deliveredDate) {
          try {
            const delDate = new Date(order.deliveryDate || order.deliveredDate);
            deliveryDate = format(delDate, "MMM dd, yyyy • h:mm a");
          } catch (e) {
            deliveryDate = order.deliveryDate || order.deliveredDate;
          }
        }
        
        return {
          id: order.orderId || order.id,
          date: formattedDate,
          deliveryDate: deliveryDate,
          trackingId: order.reference || order.orderId || order.trackingId,
          status: order.status || "pending",
          statusColor: getStatusColor(order.status),
          items: (order.items || []).map((item) => ({
            name: item.medicationName || item.name || "Unknown",
            quantity: item.quantity || 0,
            price: item.subtotal || item.unitPrice || item.price || 0,
            gram: item.gram || "",
          })),
          total: order.totalAmount || order.total || 0,
          deliveryFee: order.deliveryFee || order.shippingFee || 0,
          shippingAddress: order.shippingAddress || order.address || "",
          orderData: order,
        };
      });

      setOrders(mappedOrders);
    } catch (err) {
      console.error("❌ [HISTORY TAB] Error loading orders:", err);
      setError(err.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load orders on mount
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Refresh when tab comes into focus
  useFocusEffect(
    useCallback(() => {
      if (orders.length > 0) {
        loadOrders(true);
      } else {
        loadOrders(false);
      }
    }, [orders.length, loadOrders])
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "#009A4914";
      case "pending":
        return "#E0247814";
      case "in transit":
      case "shipped":
        return "#E0247814";
      case "cancelled":
        return "#EA4D4D14";
      default:
        return "#E0247814";
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders(true);
  }, [loadOrders]);

  const handleViewDetails = useCallback((order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  }, []);

  return (
    <View style={styles.container}>
      {/* Search box commented out as requested */}
      {/* <View style={styles.searchContainer}>
        <View
          style={[styles.searchBar, isSearchFocused && styles.searchBarFocused]}
        >
          <Ionicons name="search" size={20} color={Colors.grey} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for order.."
            placeholderTextColor={Colors.grey}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </View>
      </View> */}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Order History</Text>

        {isLoading ? (
          <View>
            {[1, 2, 3].map((i) => (
              <OrderHistoryCardSkeleton key={i} />
            ))}
          </View>
        ) : error ? (
          <EmptyState
            variant="error"
            icon="alert-circle-outline"
            title="Error Loading Orders"
            message={error}
            actionLabel="Try Again"
            onAction={() => loadOrders()}
          />
        ) : orders.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No Orders Yet"
            message="Your order history will appear here once you place an order."
          />
        ) : (
          orders.map((order) => (
            <OrderHistoryCard
              key={order.id}
              order={order}
              navigation={navigation}
              onViewDetails={handleViewDetails}
            />
          ))
        )}
      </ScrollView>

      <OrderDetailsModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        order={selectedOrder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginBottom: Sizes.md,
  },
  scrollView: {
    flex: 1,
  },
});

// Skeleton styles
const skeletonStyles = StyleSheet.create({
  skeletonCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.sm,
    marginBottom: Sizes.md,
  },
  skeletonContent: {
    padding: Sizes.md,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
  },
  skeletonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Sizes.xs,
  },
  skeletonOrderId: {
    height: 16,
    width: "40%",
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
  },
  skeletonStatus: {
    height: 20,
    width: 80,
    borderRadius: 10,
    backgroundColor: Colors.lightGray,
  },
  skeletonDate: {
    height: 12,
    width: "50%",
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginBottom: Sizes.xs,
  },
  skeletonTrackingId: {
    height: 12,
    width: "60%",
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginBottom: Sizes.md,
  },
  skeletonItems: {
    marginBottom: Sizes.md,
  },
  skeletonItem: {
    height: 14,
    width: "80%",
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginBottom: Sizes.xs,
  },
  skeletonTotal: {
    height: 16,
    width: "30%",
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    alignSelf: "flex-end",
  },
});

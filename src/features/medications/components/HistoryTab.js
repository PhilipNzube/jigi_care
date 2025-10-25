import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import OrderHistoryCard from "./OrderHistoryCard";

export default function HistoryTab({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");

  const orders = [
    {
      id: "LM12345678",
      date: "Sep 25th, 2025 • 10:05 AM",
      trackingId: "LM98765432",
      status: "Delivered",
      statusColor: "#4CAF50",
      items: [
        { name: "Metformin 500mg", quantity: 1, price: 2500 },
        { name: "Lisinopril 10mg", quantity: 3, price: 7500 },
      ],
      total: 10000,
    },
    {
      id: "LM12345679",
      date: "Sep 20th, 2025 • 2:30 PM",
      trackingId: "LM98765433",
      status: "In transit",
      statusColor: "#FF9800",
      items: [
        { name: "Acetaminophen 500mg", quantity: 2, price: 10400 },
        { name: "Omega-3 1000mg", quantity: 1, price: 3100 },
      ],
      total: 13500,
    },
  ];

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.trackingId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.grey} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for order.."
            placeholderTextColor={Colors.grey}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Order History</Text>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {filteredOrders.map((order) => (
          <OrderHistoryCard
            key={order.id}
            order={order}
            navigation={navigation}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
  },
  searchContainer: {
    marginBottom: Sizes.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 25,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchInput: {
    flex: 1,
    marginLeft: Sizes.sm,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: Sizes.md,
  },
  scrollView: {
    flex: 1,
  },
});




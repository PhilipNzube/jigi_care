import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

export default function SummaryCards({ summaryData }) {
  const summaryCards = [
    {
      id: "total",
      value: summaryData.totalTests,
      label: "Total Test",
      color: "#0098B3",
    },
    {
      id: "normal",
      value: summaryData.normalResults,
      label: "Normal",
      color: "#27AE60",
    },
    {
      id: "attention",
      value: summaryData.attentionRequired,
      label: "Attention",
      color: "#E74C3C",
    },
  ];

  const renderSummaryCard = (card) => (
    <View key={card.id} style={styles.summaryCard}>
      <Text style={[styles.summaryValue, { color: card.color }]}>
        {card.value}
      </Text>
      <Text style={styles.summaryLabel}>{card.label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.cardsContainer}>
        {summaryCards.map(renderSummaryCard)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.lg,
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Sizes.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    marginBottom: Sizes.xs,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: Colors.textSecondary,
    textAlign: "center",
  },
});


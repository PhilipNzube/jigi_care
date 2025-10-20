import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

const { width } = Dimensions.get("window");

export default function QuickActionsSection() {
  const quickActions = [
    {
      id: "consult",
      title: "Consult a Doctor",
      description: "Chat or Call licensed doctors anytime.",
      icon: "medical-outline",
      color: "#4A90E2",
    },
    {
      id: "medication",
      title: "Order Medications",
      description: "Get prescription delivered to your doorstep.",
      icon: "medical-outline",
      color: "#FF6B35",
    },
    {
      id: "lab_test",
      title: "Book Lab Test",
      description: "Schedule test with quick home sample collection.",
      icon: "flask-outline",
      color: "#9B59B6",
    },
    {
      id: "health_monitoring",
      title: "Health Monitoring",
      description: "Track vitals and get follow up reminders.",
      icon: "heart-outline",
      color: "#E74C3C",
    },
  ];

  return (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity key={action.id} style={styles.quickActionCard}>
            <View
              style={[styles.actionIcon, { backgroundColor: action.color }]}
            >
              <Ionicons name={action.icon} size={24} color={Colors.white} />
            </View>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionDescription}>{action.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quickActionsSection: {
    paddingHorizontal: Sizes.lg,
    marginBottom: Sizes.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.lg,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionCard: {
    width: (width - Sizes.lg * 2 - Sizes.md) / 2,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.lg,
    marginBottom: Sizes.md,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Sizes.xs,
  },
  actionDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
});

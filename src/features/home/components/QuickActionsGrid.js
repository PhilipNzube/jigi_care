import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

const { width } = Dimensions.get("window");

export default function QuickActionsGrid() {
  const quickActions = [
    {
      id: "consult",
      title: "Consult a Doctor",
      description: "Chat or Call licensed doctors anytime.",
      image: Images.consult,
      color: "#4A90E2",
    },
    {
      id: "medication",
      title: "Order Medications",
      description: "Get prescription delivered to your doorstep.",
      image: Images.medications,
      color: "#FF6B35",
    },
    {
      id: "lab_test",
      title: "Book Lab Test",
      description: "Schedule test with quick home sample collection.",
      image: Images.labTest,
      color: "#9B59B6",
    },
    {
      id: "health_monitoring",
      title: "Health Monitoring",
      description: "Track vitals and get follow up reminders.",
      image: Images.healthMonitoring,
      color: "#E74C3C",
    },
  ];

  return (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity key={action.id} style={styles.quickActionCard}>
            <View style={styles.actionImageContainer}>
              <Image source={action.image} style={styles.actionImage} />
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
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  actionImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
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

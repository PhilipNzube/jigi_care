import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Colors, Sizes } from "../../../shared/constants";

const { width } = Dimensions.get("window");

export default function HealthGoalsSection({ selectedGoals, onGoalToggle }) {
  const healthGoals = [
    "Consult a doctor",
    "Order Medication",
    "Track my health",
    "Book Lab Test",
    "Manage Stress",
    "Stay Healthy & Prevent illness",
  ];

  return (
    <View style={styles.goalsContainer}>
      <Text style={styles.goalsTitle}>Health Goals</Text>
      <View style={styles.goalsGrid}>
        {healthGoals.map((goal) => (
          <TouchableOpacity
            key={goal}
            style={[
              styles.goalButton,
              selectedGoals.includes(goal) && styles.goalButtonSelected,
            ]}
            onPress={() => onGoalToggle(goal)}
          >
            <Text
              style={[
                styles.goalButtonText,
                selectedGoals.includes(goal) && styles.goalButtonTextSelected,
              ]}
            >
              {goal}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  goalsContainer: {
    marginBottom: Sizes.xl,
  },
  goalsTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  goalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  goalButton: {
    width: (width - Sizes.lg * 2 - Sizes.sm) / 2,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.sm,
    borderRadius: 8,
    backgroundColor: "#E3F2FD",
    marginBottom: Sizes.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  goalButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  goalButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
    textAlign: "center",
  },
  goalButtonTextSelected: {
    color: Colors.white,
  },
});

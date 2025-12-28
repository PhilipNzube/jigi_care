import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../constants";

/**
 * Reusable Empty State Component
 * @param {Object} props
 * @param {string} props.icon - Ionicons icon name (default: "document-outline")
 * @param {string} props.title - Title text
 * @param {string} props.message - Message/subtitle text
 * @param {string} props.actionLabel - Optional action button label
 * @param {Function} props.onAction - Optional action button callback
 * @param {string} props.variant - "empty" or "error" (default: "empty")
 */
export default function EmptyState({
  icon = "document-outline",
  title,
  message,
  actionLabel,
  onAction,
  variant = "empty",
}) {
  const iconColor = variant === "error" ? "#F44336" : Colors.grey;
  const iconName = variant === "error" ? "alert-circle-outline" : icon;

  return (
    <View style={styles.container}>
      <Ionicons name={iconName} size={64} color={iconColor} />
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Sizes.xl * 2,
    paddingHorizontal: Sizes.lg,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.textPrimary,
    marginTop: Sizes.md,
    marginBottom: Sizes.xs,
    textAlign: "center",
    includeFontPadding: false,
  },
  message: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Sizes.lg,
    includeFontPadding: false,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Sizes.xl,
    paddingVertical: Sizes.md,
    borderRadius: 25,
    marginTop: Sizes.sm,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    includeFontPadding: false,
  },
});


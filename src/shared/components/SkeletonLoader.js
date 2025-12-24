/**
 * Skeleton Loader Component
 * Pre-built skeleton shapes for common UI elements
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerLoader from "./ShimmerLoader";
import { Colors, Sizes } from "../constants";

/**
 * Generic skeleton box
 */
export function SkeletonBox({ width, height, borderRadius = 8, style }) {
  return (
    <ShimmerLoader>
      <View style={[styles.skeletonBox, { width, height, borderRadius }, style]} />
    </ShimmerLoader>
  );
}

/**
 * Skeleton for text lines
 */
export function SkeletonText({ width = "100%", height = 16, lines = 1, style }) {
  return (
    <View style={[styles.textContainer, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <ShimmerLoader key={index}>
          <View
            style={[
              styles.skeletonText,
              {
                width: index === lines - 1 ? "80%" : width,
                height,
                marginBottom: index < lines - 1 ? Sizes.xs : 0,
              },
            ]}
          />
        </ShimmerLoader>
      ))}
    </View>
  );
}

/**
 * Skeleton for circular avatar
 */
export function SkeletonAvatar({ size = 40, style }) {
  return (
    <ShimmerLoader>
      <View style={[styles.skeletonAvatar, { width: size, height: size, borderRadius: size / 2 }, style]} />
    </ShimmerLoader>
  );
}

/**
 * Skeleton for card/list item
 */
export function SkeletonCard({ style }) {
  return (
    <ShimmerLoader>
      <View style={[styles.skeletonCard, style]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardAvatar} />
          <View style={styles.cardContent}>
            <View style={styles.cardTitle} />
            <View style={styles.cardSubtitle} />
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.cardFooterItem} />
          <View style={styles.cardFooterItem} />
        </View>
      </View>
    </ShimmerLoader>
  );
}

const styles = StyleSheet.create({
  skeletonBox: {
    backgroundColor: Colors.lightGray,
  },
  textContainer: {
    width: "100%",
  },
  skeletonText: {
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
  },
  skeletonAvatar: {
    backgroundColor: Colors.lightGray,
  },
  skeletonCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.md,
    marginBottom: Sizes.md,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  cardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    marginRight: Sizes.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    width: "70%",
    height: 16,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    marginBottom: Sizes.xs,
  },
  cardSubtitle: {
    width: "50%",
    height: 14,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Sizes.sm,
  },
  cardFooterItem: {
    width: "40%",
    height: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
  },
});


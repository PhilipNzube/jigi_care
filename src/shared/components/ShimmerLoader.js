/**
 * Shimmer Loader Component
 * Reusable shimmer effect wrapper matching app design
 */

import React from "react";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { Colors } from "../constants";

export default function ShimmerLoader({ children, enabled = true, speed = 1000 }) {
  if (!enabled) {
    return children;
  }

  return (
    <SkeletonPlaceholder
      backgroundColor={Colors.lightGray}
      highlightColor={Colors.primaryLight}
      speed={speed}
    >
      {children}
    </SkeletonPlaceholder>
  );
}


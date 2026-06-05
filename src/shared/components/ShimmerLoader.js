/**
 * Shimmer Loader Component
 * Reusable shimmer effect wrapper matching app design via Moti
 */

import React from "react";
import { View } from "react-native";
import { Skeleton } from "moti/skeleton";
import { Colors } from "../constants";

export default function ShimmerLoader({ children, enabled = true, speed = 1000 }) {
  if (!enabled) {
    return <>{children}</>;
  }

  // Moti maps background/highlight via standard light or dark color schemes
  // We explicitly override these colors using your layout design variables
  return (
    <Skeleton.Group show={true}>
      <Skeleton
        colorMode="light"
        colors={[Colors.lightGray || "#E1E9EE", Colors.primaryLight || "#F2F8FC"]}
        transition={{
          type: "timing",
          duration: speed,
          loop: true,
        }}
      >
        {/* We wrap children in a dummy view to ensure dimensions pass safely */}
        <View style={{ opacity: 0 }}>
          {children}
        </View>
      </Skeleton>
    </Skeleton.Group>
  );
}

/**
 * Shimmer Loader Component
 * Reusable shimmer effect wrapper matching app design via Moti
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "moti/skeleton";
import { Colors } from "../constants";

// Helper to recursively convert child placeholders into Moti Skeletons
function convertToSkeletons(children, speed) {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    const childProps = child.props || {};
    const hasChildren = React.Children.count(childProps.children) > 0;
    const style = childProps.style ? StyleSheet.flatten(childProps.style) : null;

    // A node is considered a skeleton bone if:
    // 1. It has no React children (leaf node)
    // 2. It has width or height specified in its styles
    const isBone = !hasChildren && style && (style.width !== undefined || style.height !== undefined);

    if (isBone) {
      const width = style.width !== undefined ? style.width : "100%";
      const height = style.height !== undefined ? style.height : 16;
      const borderRadius = style.borderRadius !== undefined ? style.borderRadius : 4;

      // Extract layout properties to preserve layout positioning in flex containers
      const layoutStyle = {};
      const layoutKeys = [
        "width",
        "height",
        "minWidth",
        "minHeight",
        "maxWidth",
        "maxHeight",
        "margin",
        "marginHorizontal",
        "marginVertical",
        "marginTop",
        "marginBottom",
        "marginLeft",
        "marginRight",
        "flex",
        "flexGrow",
        "flexShrink",
        "alignSelf",
        "position",
        "top",
        "bottom",
        "left",
        "right",
      ];
      layoutKeys.forEach((key) => {
        if (style[key] !== undefined) {
          layoutStyle[key] = style[key];
        }
      });

      return (
        <View style={layoutStyle}>
          <Skeleton
            colorMode="light"
            width={width}
            height={height}
            radius={borderRadius}
            colors={[
              Colors.lightGray || "#F5F5F5",
              Colors.primaryLight || "#B3E5F0",
              Colors.lightGray || "#F5F5F5",
            ]}
            transition={{
              type: "timing",
              duration: speed,
              loop: true,
            }}
          />
        </View>
      );
    }

    // If it's a container view, keep it but process its children recursively
    if (hasChildren) {
      return React.cloneElement(
        child,
        childProps,
        convertToSkeletons(childProps.children, speed)
      );
    }

    return child;
  });
}

export default function ShimmerLoader({ children, enabled = true, speed = 1200 }) {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Skeleton.Group show={true}>
      {convertToSkeletons(children, speed)}
    </Skeleton.Group>
  );
}

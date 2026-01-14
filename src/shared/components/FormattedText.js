import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Sizes } from "../constants";

/**
 * FormattedText Component
 * Formats text content with support for numbered lists
 */
export default function FormattedText({ content, style }) {
  if (!content) return null;

  // Split content by newlines
  const lines = content.split("\n");
  const formattedContent = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Check if line starts with a number followed by a period or parenthesis
    const numberedListMatch = trimmedLine.match(/^(\d+)[.)]\s*(.+)$/);

    if (numberedListMatch) {
      // It's a numbered list item
      formattedContent.push(
        <View key={index} style={styles.listItem}>
          <Text style={styles.listNumber}>{numberedListMatch[1]}.</Text>
          <Text style={[styles.listText, style]}>{numberedListMatch[2]}</Text>
        </View>
      );
    } else if (trimmedLine.match(/^[-•]\s*(.+)$/)) {
      // It's a bullet point
      const bulletMatch = trimmedLine.match(/^[-•]\s*(.+)$/);
      formattedContent.push(
        <View key={index} style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={[styles.listText, style]}>{bulletMatch[1]}</Text>
        </View>
      );
    } else if (trimmedLine.length > 0) {
      // Regular paragraph
      formattedContent.push(
        <Text key={index} style={[styles.paragraph, style]}>
          {trimmedLine}
        </Text>
      );
    } else {
      // Empty line - add spacing
      formattedContent.push(<View key={index} style={styles.emptyLine} />);
    }
  });

  return <View style={styles.container}>{formattedContent}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  paragraph: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Sizes.md,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Sizes.sm,
  },
  listNumber: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
    marginRight: Sizes.sm,
    minWidth: 24,
  },
  bullet: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
    marginRight: Sizes.sm,
    minWidth: 16,
  },
  listText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    lineHeight: 24,
    flex: 1,
  },
  emptyLine: {
    height: Sizes.sm,
  },
});

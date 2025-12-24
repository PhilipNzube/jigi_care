import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function PatientsReviewSection({ doctor }) {
  // Get reviews from doctor data (if available from API)
  // For now, using empty array as reviews are not in the API response
  const consultantData = doctor?.consultantData || {};
  const reviews = consultantData.reviews || [];

  // If no reviews, show empty state
  if (!reviews || reviews.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Patients Review</Text>
        <View style={styles.emptyContainer}>
          <Ionicons name="star-outline" size={64} color="#B0B0B0" />
          <Text style={styles.emptyTitle}>No Reviews Yet</Text>
          <Text style={styles.emptyText}>
            This doctor hasn't received any reviews yet. Be the first to leave a review after your consultation.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Patients Review</Text>
      {reviews.map((review, index) => (
        <View key={review.id || index} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name || "Patient")}&background=0098B3&color=fff&size=40`,
              }}
              style={styles.reviewerImage}
            />
            <View style={styles.reviewerInfo}>
              <Text style={styles.reviewerName}>{review.name || "Anonymous"}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{review.rating || 0}</Text>
              </View>
            </View>
            {review.timeAgo && (
              <Text style={styles.timeAgo}>{review.timeAgo}</Text>
            )}
          </View>
          <Text style={styles.reviewText}>{review.review || review.comment || ""}</Text>
          {index < reviews.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.xl,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginBottom: Sizes.md,
  },
  reviewCard: {
    marginBottom: Sizes.md,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Sizes.md,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: Sizes.xs,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
    marginLeft: Sizes.xs,
  },
  timeAgo: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#999",
  },
  reviewText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginTop: Sizes.md,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Sizes.xl * 2,
    paddingHorizontal: Sizes.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
    marginTop: Sizes.md,
    marginBottom: Sizes.sm,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { getConsultantReviews } from "../services/consultantService";
import { formatDistanceToNow, parseISO } from "date-fns";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";

// Review Skeleton Component
function ReviewSkeleton() {
  return (
    <ShimmerLoader>
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.skeletonReviewerImage} />
          <View style={styles.reviewerInfo}>
            <View style={styles.skeletonReviewerName} />
            <View style={styles.skeletonRatingContainer} />
          </View>
          <View style={styles.skeletonTimeAgo} />
        </View>
        <View style={styles.skeletonReviewTextContainer}>
          <View style={styles.skeletonReviewText} />
          <View style={[styles.skeletonReviewText, { width: "80%" }]} />
        </View>
        <View style={styles.divider} />
      </View>
    </ShimmerLoader>
  );
}

export default function PatientsReviewSection({ doctor }) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const consultantData = doctor?.consultantData || {};
  const consultantId = consultantData.userId || consultantData.id;

  useEffect(() => {
    const fetchReviews = async () => {
      if (!consultantId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log("⭐ [REVIEWS SECTION] Fetching reviews for consultant:", consultantId);
        const result = await getConsultantReviews(consultantId);
        
        // Map API response to review format
        const mappedReviews = (result.data || []).map((item) => {
          const rating = item.ratings || {};
          const user = item.users || {};
          
          // Format time ago
          let timeAgo = "";
          if (rating.createdAt) {
            try {
              const reviewDate = parseISO(rating.createdAt);
              timeAgo = formatDistanceToNow(reviewDate, { addSuffix: true });
            } catch (error) {
              console.error("Error parsing date:", error);
              timeAgo = "";
            }
          }

          return {
            id: rating.id,
            name: user.fullName || "Anonymous",
            rating: rating.rating || 0,
            review: rating.message || "",
            timeAgo: timeAgo,
            createdAt: rating.createdAt,
          };
        });

        console.log("✅ [REVIEWS SECTION] Mapped reviews:", mappedReviews.length);
        setReviews(mappedReviews);
      } catch (error) {
        console.error("❌ [REVIEWS SECTION] Error fetching reviews:", error);
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [consultantId]);

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Patients Review</Text>
        <View style={styles.loadingContainer}>
          {[1, 2, 3].map((index) => (
            <ReviewSkeleton key={index} />
          ))}
        </View>
      </View>
    );
  }

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
          {review.review && (
          <Text style={styles.reviewText}>{review.review}</Text>
          )}
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
  loadingContainer: {
    marginTop: Sizes.md,
  },
  skeletonReviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    marginRight: Sizes.md,
  },
  skeletonReviewerName: {
    width: 100,
    height: 14,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    marginBottom: Sizes.xs,
  },
  skeletonRatingContainer: {
    width: 60,
    height: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
  },
  skeletonTimeAgo: {
    width: 80,
    height: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
  },
  skeletonReviewTextContainer: {
    marginTop: Sizes.sm,
    marginBottom: Sizes.xs,
  },
  skeletonReviewText: {
    width: "100%",
    height: 14,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    marginBottom: Sizes.xs,
  },
});

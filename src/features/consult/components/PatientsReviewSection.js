import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import {
  getConsultantReviews,
  createRating,
} from "../services/consultantService";
import { formatDistanceToNow, parseISO } from "date-fns";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";
import { showError, showSuccess } from "../../../shared/utils/toast";

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
  const insets = useSafeAreaInsets();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewMessage, setReviewMessage] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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
        console.log(
          "⭐ [REVIEWS SECTION] Fetching reviews for consultant:",
          consultantId
        );
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

        console.log(
          "✅ [REVIEWS SECTION] Mapped reviews:",
          mappedReviews.length
        );
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

  const handleWriteReview = () => {
    setShowReviewModal(true);
    setReviewRating(0);
    setReviewMessage("");
  };

  const handleCloseModal = () => {
    setShowReviewModal(false);
    setReviewRating(0);
    setReviewMessage("");
  };

  // Validation helper
  const isReviewValid = () => {
    return (
      reviewRating > 0 && reviewMessage.trim().length >= 10 && consultantId
    );
  };

  const handleSubmitReview = async () => {
    if (!isReviewValid()) {
      return;
    }

    setIsSubmittingReview(true);

    try {
      console.log("⭐ [REVIEWS SECTION] Submitting review...");
      const response = await createRating(
        consultantId,
        reviewRating,
        reviewMessage.trim()
      );

      console.log("✅ [REVIEWS SECTION] Review submitted successfully");
      showSuccess("Thank you for your review!");

      // Close modal and refresh reviews
      handleCloseModal();
      fetchReviews();
    } catch (error) {
      console.error("❌ [REVIEWS SECTION] Error submitting review:", error);

      // Extract error message
      const apiErrorMessage = error.data?.message || error.message || "";

      // Check for specific message validation errors
      let errorMessage = "Unable to submit review. Please try again.";
      if (
        apiErrorMessage.includes("Message must be at least 10 characters") ||
        apiErrorMessage.includes("message should not be empty")
      ) {
        errorMessage =
          "Please write a review message with at least 10 characters.";
      } else if (apiErrorMessage) {
        errorMessage = apiErrorMessage;
      }

      showError(errorMessage);
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Patients Review</Text>
          <TouchableOpacity
            style={styles.writeReviewButton}
            onPress={handleWriteReview}
          >
            <Ionicons name="create-outline" size={18} color={Colors.primary} />
            <Text style={styles.writeReviewText}>Write Review</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="star-outline" size={64} color="#B0B0B0" />
          <Text style={styles.emptyTitle}>No Reviews Yet</Text>
          <Text style={styles.emptyText}>
            This doctor hasn't received any reviews yet. Be the first to leave a
            review after your consultation.
          </Text>
        </View>

        {/* Review Submission Modal */}
        <Modal
          visible={showReviewModal}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCloseModal}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={0}
          >
            <TouchableOpacity
              style={styles.overlayTouchable}
              activeOpacity={1}
              onPress={handleCloseModal}
            />
            <View
              style={[
                styles.modalContent,
                { paddingBottom: Math.max(insets.bottom, Sizes.xl) },
              ]}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Write a Review</Text>
                  <TouchableOpacity
                    onPress={handleCloseModal}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color={Colors.black} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBodyContent}>
                  {/* Rating Selection */}
                  <Text style={styles.modalLabel}>Rate your experience</Text>
                  <View style={styles.starRatingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setReviewRating(star)}
                        style={styles.starButton}
                      >
                        <Ionicons
                          name={star <= reviewRating ? "star" : "star-outline"}
                          size={32}
                          color={star <= reviewRating ? "#FFD700" : Colors.grey}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Review Message */}
                  <Text style={styles.modalLabel}>Your review</Text>
                  <TextInput
                    style={[
                      styles.reviewInput,
                      reviewMessage.length > 0 &&
                        reviewMessage.trim().length < 10 &&
                        styles.reviewInputError,
                    ]}
                    placeholder="Share your experience..."
                    placeholderTextColor={Colors.grey}
                    value={reviewMessage}
                    onChangeText={setReviewMessage}
                    multiline
                    maxLength={500}
                    textAlignVertical="top"
                  />
                  {reviewMessage.length > 0 &&
                    reviewMessage.trim().length < 10 && (
                      <Text style={styles.validationError}>
                        Review must be at least 10 characters long
                      </Text>
                    )}
                  <Text style={styles.characterCount}>
                    {reviewMessage.length}/500 characters
                  </Text>

                  {/* Submit Button */}
                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={[
                        styles.submitButton,
                        (!isReviewValid() || isSubmittingReview) &&
                          styles.submitButtonDisabled,
                      ]}
                      onPress={handleSubmitReview}
                      disabled={!isReviewValid() || isSubmittingReview}
                    >
                      {isSubmittingReview ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                      ) : (
                        <Text style={styles.submitButtonText}>
                          Submit Review
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Patients Review</Text>
        <TouchableOpacity
          style={styles.writeReviewButton}
          onPress={handleWriteReview}
        >
          <Ionicons name="create-outline" size={18} color={Colors.primary} />
          <Text style={styles.writeReviewText}>Write Review</Text>
        </TouchableOpacity>
      </View>
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
              <Text style={styles.reviewerName}>
                {review.name || "Anonymous"}
              </Text>
              <View style={styles.ratingContainer}>
                <View style={styles.starWrapper}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                </View>
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

      {/* Review Submission Modal */}
      <Modal
        visible={showReviewModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={handleCloseModal}
          />
          <View
            style={[
              styles.modalContent,
              { paddingBottom: Math.max(insets.bottom, Sizes.xl) },
            ]}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Write a Review</Text>
                <TouchableOpacity
                  onPress={handleCloseModal}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={Colors.black} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBodyContent}>
                {/* Rating Selection */}
                <Text style={styles.modalLabel}>Rate your experience</Text>
                <View style={styles.starRatingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setReviewRating(star)}
                      style={styles.starButton}
                    >
                      <Ionicons
                        name={star <= reviewRating ? "star" : "star-outline"}
                        size={32}
                        color={star <= reviewRating ? "#FFD700" : Colors.grey}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                {reviewRating > 0 && (
                  <Text style={styles.ratingText}>
                    {reviewRating} {reviewRating === 1 ? "star" : "stars"}
                  </Text>
                )}

                {/* Review Message */}
                <Text style={styles.modalLabel}>Your review</Text>
                <TextInput
                  style={[
                    styles.reviewInput,
                    reviewMessage.length > 0 &&
                      reviewMessage.trim().length < 10 &&
                      styles.reviewInputError,
                  ]}
                  placeholder="Share your experience..."
                  placeholderTextColor={Colors.grey}
                  value={reviewMessage}
                  onChangeText={setReviewMessage}
                  multiline
                  maxLength={500}
                  textAlignVertical="top"
                />
                {reviewMessage.length > 0 &&
                  reviewMessage.trim().length < 10 && (
                    <Text style={styles.validationError}>
                      Review must be at least 10 characters long
                    </Text>
                  )}
                <Text style={styles.characterCount}>
                  {reviewMessage.length}/500 characters
                </Text>

                {/* Submit Button */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      (!isReviewValid() || isSubmittingReview) &&
                        styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmitReview}
                    disabled={!isReviewValid() || isSubmittingReview}
                  >
                    {isSubmittingReview ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Text style={styles.submitButtonText}>Submit Review</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.xl,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
  },
  writeReviewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.xs,
    borderRadius: 20,
  },
  writeReviewText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
    marginLeft: Sizes.xs,
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
  starWrapper: {
    justifyContent: "center",
    alignItems: "center",
    height: 14,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
    marginLeft: Sizes.xs,
    lineHeight: 14,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.lg,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
  },
  closeButton: {
    padding: Sizes.xs,
  },
  modalBodyContent: {
    paddingBottom: Sizes.md,
  },
  modalLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginBottom: Sizes.md,
  },
  starRatingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  starButton: {
    padding: Sizes.xs,
    marginHorizontal: Sizes.xs,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    textAlign: "center",
    marginBottom: Sizes.lg,
  },
  reviewInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.md,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    minHeight: 120,
    marginBottom: Sizes.xs,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  reviewInputError: {
    borderColor: "#E74C3C",
    backgroundColor: "#FFF5F5",
  },
  validationError: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#E74C3C",
    marginTop: Sizes.xs,
    marginBottom: Sizes.xs,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
    textAlign: "right",
    marginBottom: Sizes.lg,
  },
  modalFooter: {
    marginTop: Sizes.lg,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Sizes.md,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
  },
});

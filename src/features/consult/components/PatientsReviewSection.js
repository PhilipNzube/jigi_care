import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function PatientsReviewSection({ doctor }) {
  const reviews = [
    {
      id: 1,
      name: "Victor Elumelu",
      rating: 4.8,
      timeAgo: "2 weeks ago",
      review:
        "Dr. Johnson is incredibly thorough and caring. She takes time to listen and explain everything clearly.",
    },
    {
      id: 2,
      name: "Elizabeth Adewunmi",
      rating: 4.5,
      timeAgo: "1 month ago",
      review:
        "Excellent doctor! Very professional and knowledgeable. Highly recommend.",
    },
    {
      id: 3,
      name: "Esther Okoye",
      rating: 4.9,
      timeAgo: "3 weeks ago",
      review:
        "I highly recommend Dr. Johnson. She is knowledgeable and her approach is very reassuring.",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Patients Review</Text>
      {reviews.map((review, index) => (
        <View key={review.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${review.name}&background=0098B3&color=fff&size=40`,
              }}
              style={styles.reviewerImage}
            />
            <View style={styles.reviewerInfo}>
              <Text style={styles.reviewerName}>{review.name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{review.rating}</Text>
              </View>
            </View>
            <Text style={styles.timeAgo}>{review.timeAgo}</Text>
          </View>
          <Text style={styles.reviewText}>{review.review}</Text>
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
    fontFamily: "Poppins-Bold",
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
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

const { width } = Dimensions.get("window");

export default function HealthTipsCarousel() {
  const healthTips = [
    {
      id: 1,
      title: "10 tips for better heart health",
      description:
        "Your heart works hard for you every day. Learn simple yet effective tips to protect it, boost your energy, and live a longer, healthier life...",
      readTime: "5 mins read",
      category: "Health",
      image: Images.healthTips,
    },
    {
      id: 2,
      title: "Managing stress during work",
      description:
        "Discover effective techniques to reduce workplace stress and maintain mental well-being...",
      readTime: "3 mins read",
      category: "Mental Health",
      image: null,
    },
    {
      id: 3,
      title: "Healthy eating habits",
      description:
        "Learn about balanced nutrition and how to make better food choices for your health...",
      readTime: "7 mins read",
      category: "Nutrition",
      image: null,
    },
  ];

  return (
    <View style={styles.healthTipsSection}>
      <Text style={styles.sectionTitle}>Health Tips</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.healthTipsScroll}
      >
        {healthTips.map((tip) => (
          <TouchableOpacity key={tip.id} style={styles.healthTipCard}>
            {tip.image ? (
              <Image source={tip.image} style={styles.healthTipImage} />
            ) : (
              <View style={styles.healthTipImagePlaceholder}>
                <Ionicons
                  name="image-outline"
                  size={40}
                  color={Colors.textSecondary}
                />
              </View>
            )}
            <View style={styles.healthTipContent}>
              <View style={styles.healthTipHeader}>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryText}>{tip.category}</Text>
                </View>
                <Text style={styles.readTime}>{tip.readTime}</Text>
              </View>
              <Text style={styles.healthTipTitle}>{tip.title}</Text>
              <Text style={styles.healthTipDescription}>{tip.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  healthTipsSection: {
    marginBottom: Sizes.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Medium",
    color: Colors.textPrimary,
    marginBottom: Sizes.lg,
    paddingHorizontal: Sizes.lg,
  },
  healthTipsScroll: {
    paddingLeft: Sizes.lg,
  },
  healthTipCard: {
    width: width * 0.85,
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    marginRight: Sizes.md,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  healthTipImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  healthTipImagePlaceholder: {
    width: "100%",
    height: 150,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  healthTipContent: {
    padding: Sizes.lg,
  },
  healthTipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.sm,
  },
  categoryTag: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
  },
  readTime: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  healthTipTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  healthTipDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

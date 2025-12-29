import React, { useState, useEffect } from "react";
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
import { getHealthTips } from "../services/healthTipsService";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";

const { width } = Dimensions.get("window");

export default function HealthTipsCarousel() {
  const [healthTips, setHealthTips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHealthTips();
  }, []);

  const fetchHealthTips = async () => {
    try {
      setIsLoading(true);
      const tips = await getHealthTips();
      
      // Map API data to UI format
      const mappedTips = tips.map((tip) => ({
        id: tip.id,
        title: tip.title || "Health Tip",
        description: tip.message || "",
        readTime: tip.minutesToRead ? `${tip.minutesToRead} mins read` : "N/A",
        category: tip.category || "Health",
        image: tip.img || null,
      }));
      
      setHealthTips(mappedTips);
    } catch (error) {
      console.error("❌ [HEALTH TIPS CAROUSEL] Error fetching health tips:", error);
      setHealthTips([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && healthTips.length === 0) {
    return (
      <View style={styles.healthTipsSection}>
        <Text style={styles.sectionTitle}>Health Tips</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.healthTipsScroll}
        >
          {[1, 2, 3].map((index) => (
            <ShimmerLoader key={index}>
              <View style={[styles.healthTipCard, { marginRight: Sizes.md }]}>
                <View style={styles.healthTipImagePlaceholder} />
                <View style={styles.healthTipContent}>
                  <View style={styles.healthTipHeader}>
                    <View style={styles.skeletonCategoryTag} />
                    <View style={styles.skeletonReadTime} />
                  </View>
                  <View style={styles.skeletonTitle} />
                  <View style={styles.skeletonDescription} />
                  <View style={styles.skeletonDescription} />
                </View>
              </View>
            </ShimmerLoader>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (healthTips.length === 0) {
    return null; // Don't show section if no tips
  }

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
              <Image source={{ uri: tip.image }} style={styles.healthTipImage} />
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
              <Text style={styles.healthTipDescription} numberOfLines={3}>
                {tip.description}
              </Text>
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
  skeletonCategoryTag: {
    width: 80,
    height: 20,
    borderRadius: 12,
  },
  skeletonReadTime: {
    width: 60,
    height: 14,
    borderRadius: 4,
  },
  skeletonTitle: {
    width: "90%",
    height: 18,
    borderRadius: 4,
    marginBottom: Sizes.xs,
  },
  skeletonDescription: {
    width: "100%",
    height: 14,
    borderRadius: 4,
    marginBottom: Sizes.xs / 2,
  },
});

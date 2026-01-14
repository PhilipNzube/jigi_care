import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
import { getHealthTipById } from "../services/healthTipsService";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";
import { showError } from "../../../shared/utils/toast";
import FormattedText from "../../../shared/components/FormattedText";

const { width } = Dimensions.get("window");

export default function HealthTipDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { tipId, tipData } = route.params || {};
  const [tip, setTip] = useState(tipData || null);
  const [isLoading, setIsLoading] = useState(!tipData);

  useEffect(() => {
    if (tipId && !tipData) {
      fetchHealthTip();
    }
  }, [tipId]);

  const fetchHealthTip = async () => {
    try {
      setIsLoading(true);
      const tipData = await getHealthTipById(tipId);
      setTip(tipData);
    } catch (error) {
      console.error("❌ [HEALTH TIP DETAIL] Error fetching tip:", error);
      showError(
        "Unable to load health tip. Please check your connection and try again."
      );
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={Images.bgImg}
          style={[styles.backgroundImage, { paddingTop: insets.top }]}
          resizeMode="cover"
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Health Tip</Text>
          </View>
        </ImageBackground>

        <View style={styles.contentWrapper}>
          <View style={styles.contentContainer}>
            <ShimmerLoader>
              <View style={styles.skeletonImage} />
            </ShimmerLoader>
            <ShimmerLoader>
              <View style={styles.skeletonTitle} />
            </ShimmerLoader>
            <ShimmerLoader>
              <View style={styles.skeletonText} />
            </ShimmerLoader>
            <ShimmerLoader>
              <View style={styles.skeletonText} />
            </ShimmerLoader>
            <ShimmerLoader>
              <View style={[styles.skeletonText, { width: "80%" }]} />
            </ShimmerLoader>
          </View>
        </View>
      </View>
    );
  }

  if (!tip) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ImageBackground
          source={Images.bgImg}
          style={[styles.backgroundImage, { paddingTop: insets.top }]}
          resizeMode="cover"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Health Tip</Text>
          </View>
        </ImageBackground>

        {/* Content with curved top */}
        <View style={styles.contentWrapper}>
          <View style={styles.contentContainer}>
            {/* Image */}
            {tip.image ? (
              <Image source={{ uri: tip.image }} style={styles.tipImage} />
            ) : (
              <View style={styles.tipImagePlaceholder}>
                <Ionicons
                  name="medical-outline"
                  size={60}
                  color={Colors.textSecondary}
                />
              </View>
            )}

            {/* Category and Read Time */}
            <View style={styles.metaContainer}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>
                  {tip.category || "Health"}
                </Text>
              </View>
              <View style={styles.readTimeContainer}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={Colors.textSecondary}
                />
                <Text style={styles.readTime}>
                  {tip.minutesToRead
                    ? `${tip.minutesToRead} mins read`
                    : tip.readTime || "N/A"}
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.tipTitle}>{tip.title || "Health Tip"}</Text>

            {/* Description/Content */}
            <FormattedText
              content={
                tip.message || tip.description || "No content available."
              }
              style={styles.tipContent}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Sizes.xl,
  },
  backgroundImage: {
    width: "100%",
    paddingBottom: Sizes.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
  contentWrapper: {
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingTop: Sizes.xl,
  },
  contentContainer: {
    paddingHorizontal: Sizes.lg,
  },
  tipImage: {
    width: "100%",
    height: 250,
    borderRadius: 16,
    marginBottom: Sizes.lg,
    resizeMode: "cover",
  },
  tipImagePlaceholder: {
    width: "100%",
    height: 250,
    borderRadius: 16,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  categoryTag: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.xs,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
  },
  readTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Sizes.xs,
  },
  readTime: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  tipTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
    lineHeight: 32,
  },
  tipContent: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  skeletonImage: {
    width: "100%",
    height: 250,
    borderRadius: 16,
    marginBottom: Sizes.lg,
  },
  skeletonTitle: {
    width: "90%",
    height: 28,
    borderRadius: 4,
    marginBottom: Sizes.md,
  },
  skeletonText: {
    width: "100%",
    height: 16,
    borderRadius: 4,
    marginBottom: Sizes.xs,
  },
});

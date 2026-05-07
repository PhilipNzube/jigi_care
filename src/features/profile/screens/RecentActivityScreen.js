import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { getRecentActivities } from "../services/recentActivityService";
import { format, parseISO } from "date-fns";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";

export default function RecentActivityScreen({ navigation }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await getRecentActivities();
      
      const mapped = data.map((activity) => {
        let formattedDate = "N/A";
        if (activity.createdAt || activity.date) {
          try {
            const date = parseISO(activity.createdAt || activity.date);
            formattedDate = format(date, "MMM dd, yyyy • hh:mm a");
          } catch (e) {
            formattedDate = activity.createdAt || activity.date || "N/A";
          }
        }

        const action = activity.action || activity.title || activity.message || "Activity";
        const lowerAction = action.toLowerCase();
        
        let icon = "notifications-outline";
        let iconColor = "#0098B3";
        let bgColor = "#E0F2F7";

        if (lowerAction.includes("booked") || lowerAction.includes("appointment")) {
          icon = "calendar-outline";
          iconColor = "#FF9800";
          bgColor = "#FFF3E0";
        } else if (lowerAction.includes("chat") || lowerAction.includes("message")) {
          icon = "chatbubble-ellipses-outline";
          iconColor = "#4CAF50";
          bgColor = "#E8F5E9";
        } else if (lowerAction.includes("payment") || lowerAction.includes("paid")) {
          icon = "card-outline";
          iconColor = "#9C27B0";
          bgColor = "#F3E5F5";
        } else if (lowerAction.includes("consult")) {
          icon = "medical-outline";
          iconColor = "#E91E63";
          bgColor = "#FCE4EC";
        } else if (lowerAction.includes("upload") || lowerAction.includes("file")) {
          icon = "document-attach-outline";
          iconColor = "#2196F3";
          bgColor = "#E3F2FD";
        }

        return {
          id: activity.id || Math.random().toString(),
          title: action,
          date: formattedDate,
          icon,
          iconColor,
          bgColor,
        };
      });

      setActivities(mapped);
    } catch (error) {
      console.error("Error fetching all activities:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recent Activity</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {isLoading && activities.length === 0 ? (
          <View style={styles.skeletonContainer}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ShimmerLoader key={i}>
                <View style={styles.skeletonItem} />
              </ShimmerLoader>
            ))}
          </View>
        ) : activities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={80} color="#DDD" />
            <Text style={styles.emptyText}>No activity found</Text>
          </View>
        ) : (
          <View style={styles.activitiesContainer}>
            {activities.map((activity, index) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardDateTime}>{activity.date}</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={[styles.iconContainer, { backgroundColor: activity.bgColor }]}>
                    <Ionicons name={activity.icon} size={24} color={activity.iconColor} />
                  </View>
                  <View style={styles.textContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: Sizes.lg,
  },
  activitiesContainer: {
    paddingBottom: Sizes.xl,
  },
  activityCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingTop: Sizes.md,
    paddingHorizontal: Sizes.sm,
    paddingBottom: Sizes.sm,
    marginBottom: Sizes.md,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Sizes.sm,
    paddingHorizontal: Sizes.sm,
  },
  cardDateTime: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    padding: Sizes.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
  },
  textContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#333",
  },
  skeletonContainer: {
    gap: Sizes.md,
  },
  skeletonItem: {
    height: 80,
    borderRadius: 16,
    backgroundColor: "#EEE",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#999",
    marginTop: Sizes.md,
  },
});

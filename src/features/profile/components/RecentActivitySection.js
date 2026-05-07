import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { getRecentActivities } from "../services/recentActivityService";
import { format, parseISO } from "date-fns";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";
import { useNavigation } from "@react-navigation/native";

export default function RecentActivitySection() {
  const navigation = useNavigation();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      setIsLoading(true);
      const activitiesData = await getRecentActivities();
      
      // Map API data to UI format with icons and colors
      const mappedActivities = activitiesData.map((activity) => {
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
        } else if (lowerAction.includes("upload") || lowerAction.includes("file") || lowerAction.includes("attachment")) {
          icon = "document-attach-outline";
          iconColor = "#2196F3";
          bgColor = "#E3F2FD";
        } else if (lowerAction.includes("cancel")) {
          icon = "close-circle-outline";
          iconColor = Colors.error;
          bgColor = "#FFEBEE";
        }
        
        return {
          id: activity.id,
          title: action,
          date: formattedDate,
          icon,
          iconColor,
          bgColor,
        };
      });
      
      setActivities(mappedActivities);
    } catch (error) {
      console.error("❌ [RECENT ACTIVITY SECTION] Error fetching activities:", error);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && activities.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.card}>
          {[1, 2, 3].map((index) => (
            <View key={index} style={styles.activityItem}>
              <ShimmerLoader>
                <View style={styles.skeletonRow}>
                  <View style={styles.skeletonIcon} />
                  <View style={styles.skeletonTextContent}>
                    <View style={styles.skeletonTitle} />
                    <View style={styles.skeletonDate} />
                  </View>
                </View>
              </ShimmerLoader>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (activities.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.card}>
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>No recent activities yet</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate("RecentActivity")}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          {activities.slice(0, 3).map((activity, index) => (
            <View key={activity.id ? `${activity.id}-${index}` : `activity-${index}`}>
              <View style={styles.activityItem}>
                <View style={[styles.iconContainer, { backgroundColor: activity.bgColor }]}>
                  <Ionicons name={activity.icon} size={20} color={activity.iconColor} />
                </View>
                <View style={styles.textContent}>
                  <Text style={styles.activityTitle} numberOfLines={1}>{activity.title}</Text>
                  <Text style={styles.activityDate}>{activity.date}</Text>
                </View>
              </View>
              {index < 2 && index < activities.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Sizes.sm,
    paddingHorizontal: Sizes.sm,
    paddingTop: Sizes.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginLeft: Sizes.sm,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: Colors.primary,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  content: {
    paddingHorizontal: Sizes.md,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Sizes.md,
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
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "#333333",
    lineHeight: 20,
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#888888",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Sizes.xl,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#999999",
    marginTop: Sizes.sm,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E0E0E0",
    marginRight: Sizes.md,
  },
  skeletonTextContent: {
    flex: 1,
  },
  skeletonTitle: {
    width: "70%",
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginBottom: 8,
  },
  skeletonDate: {
    width: "40%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },
});

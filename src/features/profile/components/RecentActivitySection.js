import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import { getRecentActivities } from "../services/recentActivityService";
import { format, parseISO } from "date-fns";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";

export default function RecentActivitySection() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      setIsLoading(true);
      const activitiesData = await getRecentActivities();
      
      // Map API data to UI format
      const mappedActivities = activitiesData.map((activity) => {
        let formattedDate = "N/A";
        if (activity.createdAt || activity.date) {
          try {
            const date = parseISO(activity.createdAt || activity.date);
            formattedDate = format(date, "MMM dd, yyyy");
          } catch (e) {
            formattedDate = activity.createdAt || activity.date || "N/A";
          }
        }
        
        return {
          id: activity.id,
          title: activity.title || activity.message || "Activity",
          date: formattedDate,
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
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.content}>
            {[1, 2, 3].map((index) => (
              <View key={index}>
                <ShimmerLoader>
                  <View style={styles.activityItem}>
                    <View style={styles.skeletonTitle} />
                    <View style={styles.skeletonDate} />
                  </View>
                </ShimmerLoader>
                {index < 3 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (activities.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.content}>
            <Text style={styles.emptyText}>No recent activities</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.content}>
          {activities.map((activity, index) => (
            <View key={activity.id}>
              <View style={styles.activityItem}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDate}>{activity.date}</Text>
              </View>
              {index < activities.length - 1 && <View style={styles.divider} />}
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginLeft: Sizes.sm,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.sm,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  content: {
    padding: Sizes.md,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
  },
  activityItem: {
    paddingVertical: Sizes.sm,
  },
  activityTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: Colors.black,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666666",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: Sizes.sm,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    paddingVertical: Sizes.md,
  },
  skeletonTitle: {
    width: "80%",
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonDate: {
    width: "40%",
    height: 14,
    borderRadius: 4,
  },
});

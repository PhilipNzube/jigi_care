import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Sizes, Colors } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";
// import { connectNotificationStream } from "../services/notificationService"; // Commented out - may be useful later
import { getAllNotifications, markNotificationRead } from "../services/notificationService";
import ShimmerLoader from "../../../shared/components/ShimmerLoader";
import { useAuth } from "../../../shared/context/AuthContext";

// Import components
import NotificationsHeader from "../components/NotificationsHeader";
import NotificationsList from "../components/NotificationsList";
import EmptyNotificationsState from "../components/EmptyNotificationsState";

const { width, height } = Dimensions.get("window");

/**
 * Map API notification to UI format
 */
const mapNotificationToUI = (apiNotification) => {
  // Determine icon based on category
  let iconImage = Images.consult; // Default
  let action = "View";

  if (apiNotification.category === "booking") {
    iconImage = Images.consult;
    action = "View Booking";
  } else if (apiNotification.category === "order") {
    iconImage = Images.medications;
    action = "View Order";
  }

  return {
    id: apiNotification.id,
    iconImage: iconImage,
    title: apiNotification.title || "Notification",
    description: apiNotification.message || "",
    action: action,
    status: apiNotification.status,
    category: apiNotification.category,
    createdAt: apiNotification.createdAt,
    originalData: apiNotification, // Keep original for actions
  };
};

export default function NotificationsScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // COMMENTED OUT - Stream API may be useful later for real-time updates
  // const cleanupRef = useRef(null);

  const fetchNotifications = React.useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }

    try {
      console.log("🔔 [NOTIFICATIONS SCREEN] Fetching notifications...");
      const notificationsData = await getAllNotifications();

      // Map API notifications to UI format
      const mappedNotifications = notificationsData.map(mapNotificationToUI);

      // Sort by createdAt (newest first)
      mappedNotifications.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      setNotifications(mappedNotifications);
      console.log(
        "✅ [NOTIFICATIONS SCREEN] Notifications loaded:",
        mappedNotifications.length
      );
    } catch (error) {
      console.error(
        "❌ [NOTIFICATIONS SCREEN] Error fetching notifications:",
        error
      );
      setNotifications([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // COMMENTED OUT - Stream API implementation
  // useEffect(() => {
  //   let hasReceivedData = false;

  //   // Connect to notification stream
  //   const cleanup = connectNotificationStream(
  //     (data) => {
  //       console.log(
  //         "🔔 [NOTIFICATIONS SCREEN] Received notification data:",
  //         data
  //       );

  //       if (data && data.notifications && Array.isArray(data.notifications)) {
  //         // Map API notifications to UI format
  //         const mappedNotifications =
  //           data.notifications.map(mapNotificationToUI);

  //         // Sort by createdAt (newest first)
  //         mappedNotifications.sort((a, b) => {
  //           const dateA = new Date(a.createdAt || 0);
  //           const dateB = new Date(b.createdAt || 0);
  //           return dateB - dateA;
  //         });

  //         setNotifications(mappedNotifications);

  //         // Only set loading to false once we've received data
  //         if (!hasReceivedData) {
  //           hasReceivedData = true;
  //           setIsLoading(false);
  //         }
  //         setRefreshing(false);
  //       }
  //     },
  //     (error) => {
  //       console.error(
  //         "❌ [NOTIFICATIONS SCREEN] Notification stream error:",
  //         error
  //       );
  //       setIsLoading(false);
  //       setRefreshing(false);
  //     }
  //   );

  //   cleanupRef.current = cleanup;

  //   return () => {
  //     if (cleanupRef.current && typeof cleanupRef.current === "function") {
  //       try {
  //         cleanupRef.current();
  //       } catch (error) {
  //         console.error(
  //           "❌ [NOTIFICATIONS SCREEN] Error during cleanup:",
  //           error
  //         );
  //       }
  //     }
  //     cleanupRef.current = null;
  //   };
  // }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications(true);
  }, [fetchNotifications]);

  const handleNotificationAction = async (notification) => {
    console.log("Notification pressed:", notification.title);
    
    // Mark as read if not already read
    if (notification.status !== "read") {
      try {
        await markNotificationRead(notification.id);
        // Optimistically update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, status: "read" } : n
          )
        );
        // Update notification count in context so it reflects on Home Screen immediately
        if (user && user.notificationCount > 0) {
          updateUser({
            ...user,
            notificationCount: user.notificationCount - 1
          });
        }
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }

    // Handle different notification actions based on category
    if (notification.category === "booking") {
      // Navigate to booking details or consult screen
      navigation.navigate("BottomTabs", { screen: "Consult" });
    } else if (notification.category === "order") {
      // Navigate to order details
      navigation.navigate("BottomTabs", { screen: "Medication" });
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={Images.bgImg}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Header */}
        <NotificationsHeader onClose={() => navigation.goBack()} />

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              {[1, 2, 3, 4, 5].map((index) => (
                <ShimmerLoader key={index}>
                  <View style={styles.notificationSkeleton}>
                    <View style={styles.skeletonContent}>
                      <View style={styles.skeletonIcon} />
                      <View style={styles.skeletonTextContainer}>
                        <View style={styles.skeletonTitle} />
                        <View style={styles.skeletonDescription} />
                      </View>
                      <View style={styles.skeletonActionButton} />
                    </View>
                    {index < 5 && <View style={styles.skeletonDivider} />}
                  </View>
                </ShimmerLoader>
              ))}
            </View>
          ) : notifications.length > 0 ? (
            <NotificationsList
              notifications={notifications}
              onNotificationAction={handleNotificationAction}
            />
          ) : (
            <EmptyNotificationsState />
          )}
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  content: {
    flex: 1,
    marginTop: Sizes.lg,
  },
  contentContainer: {
    paddingHorizontal: Sizes.lg,
    paddingBottom: Sizes.xl,
  },
  loadingContainer: {
    backgroundColor: "#FFFFFF14",
    borderRadius: 16,
    padding: Sizes.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  notificationSkeleton: {
    paddingVertical: Sizes.sm,
  },
  skeletonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: Colors.lightGray,
    marginRight: Sizes.md,
  },
  skeletonTextContainer: {
    flex: 1,
    marginRight: Sizes.sm,
  },
  skeletonTitle: {
    width: "70%",
    height: 16,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginBottom: Sizes.xs,
  },
  skeletonDescription: {
    width: "90%",
    height: 14,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
  },
  skeletonActionButton: {
    width: 80,
    height: 32,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
  },
  skeletonDivider: {
    height: 1,
    backgroundColor: "#FFFFFF40",
    marginTop: Sizes.sm,
    marginHorizontal: Sizes.sm,
  },
});

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Dimensions,
} from "react-native";
import { Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

// Import components
import NotificationsHeader from "../components/NotificationsHeader";
import NotificationsList from "../components/NotificationsList";
import EmptyNotificationsState from "../components/EmptyNotificationsState";

const { width, height } = Dimensions.get("window");

export default function NotificationsScreen({ navigation }) {
  const [hasNotifications, setHasNotifications] = useState(true);

  const notifications = [
    {
      id: 1,
      iconImage: Images.consult,
      title: "Consultation Reminder",
      description: "Your consultation with Dr. Benson starts in 10 mins.",
      action: "Join Now",
    },
    {
      id: 2,
      iconImage: Images.healthMonitoring,
      title: "Health Tips & Articles",
      description: "New Article: Managing stress for better sleep.",
      action: "Read Now",
    },
    {
      id: 3,
      iconImage: Images.labTest,
      title: "Lab Test Update",
      description: "Your blood test results are now available.",
      action: "View Results",
    },
    {
      id: 4,
      iconImage: Images.healthMonitoring,
      title: "Health Tips & Articles",
      description: "New Article: Managing stress for better sleep.",
      action: "Read Now",
    },
    {
      id: 5,
      iconImage: Images.medications,
      title: "Medicine Reminder",
      description: "Time to your 8 AM medicine.",
      action: "Mark as Taken",
    },
    {
      id: 6,
      iconImage: Images.consult,
      title: "Consultation Reminder",
      description: "Your consultation with Dr. Benson starts in 30 mins.",
      action: "Join Now",
    },
  ];

  const handleNotificationAction = (notification) => {
    console.log("Notification action pressed:", notification.action);
    // Handle different notification actions here
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
        >
          {hasNotifications ? (
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
});

import React from "react";
import { View, StyleSheet } from "react-native";
import { Sizes } from "../../../shared/constants";
import NotificationCard from "./NotificationCard";

export default function NotificationsList({
  notifications,
  onNotificationAction,
}) {
  return (
    <View style={styles.notificationsContainer}>
      {notifications.map((notification, index) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onActionPress={onNotificationAction}
          isLast={index === notifications.length - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  notificationsContainer: {
    backgroundColor: "#FFFFFF14",
    borderRadius: 16,
    padding: Sizes.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    gap: Sizes.md,
  },
});

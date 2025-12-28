import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Colors, Sizes } from "../../../shared/constants";
import { Images } from "../../../shared/utils/imageUtils";

export default function NotificationCard({
  notification,
  onActionPress,
  isLast = false,
}) {
  return (
    <View style={styles.notificationRow}>
      <View style={styles.notificationContent}>
        <View style={styles.notificationText}>
          <View style={styles.notificationTitleContainer}>
            <View style={styles.notificationIcon}>
              <Image
                source={notification.iconImage}
                style={styles.iconImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
          </View>
          <Text style={styles.notificationDescription}>
            {notification.description}
          </Text>
        </View>
        {/* Commented out - buttons may be useful later */}
        {/* <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onActionPress(notification)}
        >
          <Text style={styles.actionButtonText}>{notification.action}</Text>
        </TouchableOpacity> */}
      </View>
      {!isLast && <View style={styles.divider} />}
    </View>
  );
}

const styles = StyleSheet.create({
  notificationRow: {
    paddingVertical: Sizes.sm,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: "#FFFFFF1F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
  },
  iconImage: {
    width: 24,
    height: 24,
  },
  notificationTitleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  notificationText: {
    flex: 1,
    marginRight: Sizes.sm,
  },
  notificationTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
    marginBottom: Sizes.xs,
    flex: 1,
    flexWrap: "wrap",
  },
  notificationDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
    opacity: 0.9,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: "#0098B3",
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: 20,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: "#FFFFFF40",
    marginTop: Sizes.sm,
    marginHorizontal: Sizes.sm,
  },
});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { useAuth } from "../../../shared/context/AuthContext";

export default function Header({ insets }) {
  const { user } = useAuth();

  // Extract first name from fullName for greeting
  const getFirstName = () => {
    if (!user) return "there";
    const fullName = user?.fullName || user?.name || "";
    const firstName = fullName.split(" ")[0];
    return firstName || "there";
  };

  const firstName = getFirstName();

  return (
    <View style={[styles.header, { paddingTop: insets.top + Sizes.md }]}>
      <View style={styles.headerContent}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {user?.dp ? (
              <Image source={{ uri: user.dp }} style={styles.profileImage} />
            ) : (
              <Ionicons name="person" size={30} color={Colors.white} />
            )}
          </View>
          <View style={styles.greetingSection}>
            <Text style={styles.greetingText} numberOfLines={2}>Hello {firstName},</Text>
            <Text style={styles.subGreetingText}>
              How are you feeling today?
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={Colors.white}
          />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#2C3E50",
    paddingHorizontal: Sizes.lg,
    paddingBottom: Sizes.lg,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
    overflow: "hidden",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  greetingSection: {},
  greetingText: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
  subGreetingText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
    opacity: 0.8,
  },
  notificationButton: {
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E74C3C",
  },
});

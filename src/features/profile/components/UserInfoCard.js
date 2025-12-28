import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";
import { useAuth } from "../../../shared/context/AuthContext";

export default function UserInfoCard({ onEdit }) {
  const { user } = useAuth();

  // Extract user data with fallbacks - check multiple possible field names
  const userName = user?.fullName || user?.name || "User";
  const userEmail = user?.email || "";
  // Check multiple possible phone field names from backend
  const userPhone = user?.phone || user?.phoneNumber || user?.mobile || user?.mobileNumber || user?.contactNumber || "";

  return (
    <View style={styles.container}>
      <View style={styles.profileImageContainer}>
        <Ionicons name="person" size={40} color={Colors.white} />
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={2}>{userName}</Text>
        {userEmail ? <Text style={styles.userEmail} numberOfLines={2}>{userEmail}</Text> : null}
        {userPhone ? <Text style={styles.userPhone} numberOfLines={2}>{userPhone}</Text> : null}
      </View>

      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <Ionicons name="pencil" size={20} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 15,
    padding: Sizes.lg,
    marginHorizontal: Sizes.lg,
    marginVertical: Sizes.md,
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Sizes.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: Colors.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});

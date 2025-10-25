import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function UserInfoCard({ onEdit }) {
  return (
    <View style={styles.container}>
      <View style={styles.profileImageContainer}>
        <Ionicons name="person" size={40} color={Colors.white} />
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName}>Tim Bod</Text>
        <Text style={styles.userEmail}>timbod@email.com</Text>
        <Text style={styles.userPhone}>+2345678901234</Text>
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

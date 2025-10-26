import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Sizes } from "../../../shared/constants";

export default function ProfilePictureSection() {
  return (
    <View style={styles.container}>
      <View style={styles.profileImageContainer}>
        <Ionicons name="person" size={60} color={Colors.white} />
        <TouchableOpacity style={styles.cameraButton}>
          <Ionicons name="camera" size={16} color={Colors.black} />
        </TouchableOpacity>
      </View>

      <Text style={styles.joinedText}>Joined Jigicare</Text>
      <Text style={styles.dateText}>Sep 24th, 2025</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: Sizes.lg,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Sizes.sm,
    position: "relative",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  joinedText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#999999",
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grey,
  },
});




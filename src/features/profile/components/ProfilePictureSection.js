import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Colors, Sizes } from "../../../shared/constants";
import { useAuth } from "../../../shared/context/AuthContext";
import { uploadImage, updateProfilePicture } from "../services/profileService";
import { showError, showSuccess } from "../../../shared/utils/toast";
import { format, parseISO } from "date-fns";

export default function ProfilePictureSection() {
  const { user, updateUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  // Format dateJoined
  const formatDateJoined = () => {
    if (!user?.dateJoined) return "N/A";
    try {
      const date = parseISO(user.dateJoined);
      const month = date.toLocaleString("default", { month: "short" });
      const day = date.getDate();
      const year = date.getFullYear();
      // Get ordinal suffix for day
      const getOrdinalSuffix = (day) => {
        if (day > 3 && day < 21) return "th";
        switch (day % 10) {
          case 1: return "st";
          case 2: return "nd";
          case 3: return "rd";
          default: return "th";
        }
      };
      return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
    } catch (error) {
      return "N/A";
    }
  };

  const handleImagePicker = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need access to your photos to update your profile picture."
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultiple: false,
      });

      if (result.canceled) {
        return;
      }

      const imageUri = result.assets[0].uri;
      
      // Check file size (10MB = 10 * 1024 * 1024 bytes)
      const fileSize = result.assets[0].fileSize || 0;
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (fileSize > maxSize) {
        showError("Image size must be less than 10MB");
        return;
      }

      // Crop and resize image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 800 } }, // Resize to max 800px width
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Upload image
      setIsUploading(true);
      const uploadResult = await uploadImage(manipulatedImage.uri);
      
      if (!uploadResult.secure_url) {
        throw new Error("Upload failed - no secure URL returned");
      }

      // Update profile picture
      const updatedUser = await updateProfilePicture(uploadResult.secure_url);
      
      // Update user in context
      await updateUser(updatedUser);
      
      showSuccess("Profile picture updated successfully!");
    } catch (error) {
      console.error("❌ [PROFILE PICTURE] Error updating profile picture:", error);
      showError(error.message || "Failed to update profile picture. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileImageWrapper}>
        <View style={styles.profileImageContainer}>
          {user?.dp ? (
            <Image source={{ uri: user.dp }} style={styles.profileImage} />
          ) : (
            <Ionicons name="person" size={60} color={Colors.white} />
          )}
        </View>
        <TouchableOpacity 
          style={styles.cameraButton}
          onPress={handleImagePicker}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color={Colors.black} />
          ) : (
            <Ionicons name="camera" size={16} color={Colors.black} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.joinedText}>Joined Jigi Care</Text>
      <Text style={styles.dateText}>{formatDateJoined()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: Sizes.lg,
  },
  profileImageWrapper: {
    position: "relative",
    marginBottom: Sizes.sm,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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





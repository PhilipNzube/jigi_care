/**
 * Profile Service
 * Handles profile-related API calls
 */

import { get, patch, uploadFile } from "../../../shared/services/api";

/**
 * Get profile card stats (appointments, reports, active meds)
 * @returns {Promise<object>} - Profile card data
 */
export const getProfileCardStats = async () => {
  try {
    const response = await get("/users/patient/profile-card");
    if (response && (response.sucess || response.success) && response.data) {
      return response.data;
    }
    return { appointments: 0, reports: 0, activeMeds: 0 };
  } catch (error) {
    console.error(
      "❌ [PROFILE SERVICE] Error fetching profile card stats:",
      error
    );
    throw error;
  }
};

/**
 * Upload image file
 * @param {string} fileUri - Local file URI
 * @returns {Promise<object>} - Response with secure_url and public_id
 */
export const uploadImage = async (fileUri) => {
  try {
    console.log("📤 [PROFILE SERVICE] Uploading image...");

    // Determine file type from URI
    const fileExtension = fileUri.split(".").pop().toLowerCase();
    const mimeType = fileExtension === "png" ? "image/png" : "image/jpeg";
    const fileName = `profile-image.${fileExtension}`;

    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      type: mimeType,
      name: fileName,
    });

    const response = await uploadFile("/upload/image", formData);

    if (response && response.success && response.data) {
      console.log("✅ [PROFILE SERVICE] Image uploaded successfully!");
      return response.data;
    }

    throw new Error("Image upload failed");
  } catch (error) {
    console.error("❌ [PROFILE SERVICE] Error uploading image:", error);
    throw error;
  }
};

/**
 * Update profile picture
 * @param {string} dp - Profile picture URL (secure_url from upload)
 * @returns {Promise<object>} - Updated user data
 */
export const updateProfilePicture = async (dp) => {
  try {
    console.log("📝 [PROFILE SERVICE] Updating profile picture...");

    const response = await patch("/users/profile-pic/update", { dp });

    if (response && (response.sucess || response.success) && response.data) {
      console.log("✅ [PROFILE SERVICE] Profile picture updated successfully!");
      return response.data;
    }

    throw new Error("Profile picture update failed");
  } catch (error) {
    console.error(
      "❌ [PROFILE SERVICE] Error updating profile picture:",
      error
    );
    throw error;
  }
};

export default {
  getProfileCardStats,
  uploadImage,
  updateProfilePicture,
};

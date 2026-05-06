import { uploadFile as apiUploadFile } from "./api";
import { Platform } from "react-native";

/**
 * Upload a file to the server
 * @param {object} file - The file to upload (result from image picker or document picker)
 * @returns {Promise<object>} - { success: true, data: { fileUrl, fileType } }
 */
export const uploadFile = async (file) => {
  console.log("📤 [UPLOAD SERVICE] Uploading file...");
  
  try {
    const formData = new FormData();
    
    // Construct the file object for FormData
    const fileUri = file.uri;
    const fileName = file.name || fileUri.split("/").pop();
    const fileType = file.mimeType || file.type || "application/octet-stream";
    
    formData.append("file", {
      uri: Platform.OS === "android" ? fileUri : fileUri.replace("file://", ""),
      name: fileName,
      type: fileType,
    });

    const response = await apiUploadFile("/upload/file", formData);

    return response;
  } catch (error) {
    console.error("❌ [UPLOAD SERVICE] Error uploading file:", error);
    throw error;
  }
};

export default {
  uploadFile,
};

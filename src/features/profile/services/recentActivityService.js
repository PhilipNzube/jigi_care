/**
 * Recent Activity Service
 * Handles fetching recent activities from the API
 */

import { get } from "../../../shared/services/api";

/**
 * Get recent activities
 * @returns {Promise<Array>} - Array of recent activities
 */
export const getRecentActivities = async () => {
  try {
    console.log("📋 [RECENT ACTIVITY SERVICE] Fetching recent activities...");
    const response = await get("/recent-activity");
    
    if (response && response.success && response.data && Array.isArray(response.data)) {
      console.log(
        "✅ [RECENT ACTIVITY SERVICE] Fetched recent activities:",
        response.data.length
      );
      return response.data;
    }
    
    console.warn("⚠️ [RECENT ACTIVITY SERVICE] Unexpected response format:", response);
    return [];
  } catch (error) {
    console.error("❌ [RECENT ACTIVITY SERVICE] Error fetching recent activities:", error);
    throw error;
  }
};

export default {
  getRecentActivities,
};


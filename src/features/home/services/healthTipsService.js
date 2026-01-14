/**
 * Health Tips Service
 * Handles fetching health tips from the API
 */

import { get } from "../../../shared/services/api";

/**
 * Get all health tips
 * @returns {Promise<Array>} - Array of health tips
 */
export const getHealthTips = async () => {
  try {
    console.log("💡 [HEALTH TIPS SERVICE] Fetching health tips...");
    const response = await get("/health-tips");
    
    if (response && response.success && response.data && Array.isArray(response.data)) {
      console.log(
        "✅ [HEALTH TIPS SERVICE] Fetched health tips:",
        response.data.length
      );
      return response.data;
    }
    
    console.warn("⚠️ [HEALTH TIPS SERVICE] Unexpected response format:", response);
    return [];
  } catch (error) {
    console.error("❌ [HEALTH TIPS SERVICE] Error fetching health tips:", error);
    throw error;
  }
};

/**
 * Get health tip by ID
 * @param {string} id - Health tip ID
 * @returns {Promise<object>} - Health tip details
 */
export const getHealthTipById = async (id) => {
  try {
    console.log("💡 [HEALTH TIPS SERVICE] Fetching health tip:", id);
    const response = await get(`/health-tips/${id}`);
    
    if (response && response.success && response.data) {
      console.log("✅ [HEALTH TIPS SERVICE] Fetched health tip");
      return response.data;
    }
    
    console.warn("⚠️ [HEALTH TIPS SERVICE] Unexpected response format:", response);
    return null;
  } catch (error) {
    console.error("❌ [HEALTH TIPS SERVICE] Error fetching health tip:", error);
    throw error;
  }
};

export default {
  getHealthTips,
  getHealthTipById,
};


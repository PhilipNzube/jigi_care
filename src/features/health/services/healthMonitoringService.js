import { get, patch } from "../../../shared/services/api";

/**
 * Get health monitoring data
 * @returns {Promise<Array>} - Health monitoring records
 */
export const getHealthMonitoring = async () => {
  try {
    const response = await get("/health-monitoring");
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("❌ [HEALTH MONITORING SERVICE] Error fetching health monitoring:", error);
    throw error;
  }
};

/**
 * Update health monitoring reading
 * @param {string} id - Health monitoring record ID
 * @param {object} data - Updated vital sign data (only the vital sign being updated)
 * @returns {Promise<object>} - Updated health monitoring record
 */
export const updateHealthReading = async (id, data) => {
  try {
    const response = await patch(`/health-monitoring/${id}`, data);
    if (response && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("❌ [HEALTH MONITORING SERVICE] Error updating health reading:", error);
    throw error;
  }
};

export default {
  getHealthMonitoring,
  updateHealthReading,
};


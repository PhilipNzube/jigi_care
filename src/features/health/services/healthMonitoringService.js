import { get, patch } from "../../../shared/services/api";

/**
 * Get health monitoring data
 * @returns {Promise<Array>} - Health monitoring records (array of records or single record)
 */
export const getHealthMonitoring = async () => {
  try {
    const response = await get("/health-monitoring");
    if (response && response.data) {
      // Handle both array and object responses
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (typeof response.data === "object" && response.data !== null) {
        // If it's a single object, return it as an array with one element
        return [response.data];
      }
    }
    return [];
  } catch (error) {
    console.error(
      "❌ [HEALTH MONITORING SERVICE] Error fetching health monitoring:",
      error
    );
    throw error;
  }
};

/**
 * Update health monitoring reading
 * @param {object} data - Updated vital sign data (only the vital sign being updated)
 *   Example: { bloodPressure: { systolic: 120, diastolic: 80, status: "normal", note: "..." } }
 *   Or: { temperature: { value: 37.2, status: "normal", note: "..." } }
 *   Or: { heartRate: { value: 72, status: "normal", note: "..." } }
 *   Or: { weight: { value: 70.5, status: "normal", note: "..." } }
 * @returns {Promise<object>} - Updated health monitoring record
 */
export const updateHealthReading = async (data) => {
  try {
    // Always use PATCH to base endpoint - no ID needed
    // The API handles creating/updating the record automatically
    const response = await patch(`/health-monitoring`, data);
    if (response && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error(
      "❌ [HEALTH MONITORING SERVICE] Error updating health reading:",
      error
    );
    throw error;
  }
};

/**
 * Get blood pressure trends
 * @returns {Promise<object>} - Blood pressure trends data with readings
 */
export const getBloodPressureTrends = async () => {
  try {
    const response = await get("/health-monitoring/blood-pressure/trends");
    if (response && response.success && response.data) {
      return response.data;
    }
    return { readings: [], period: "last_7_days" };
  } catch (error) {
    console.error(
      "❌ [HEALTH MONITORING SERVICE] Error fetching blood pressure trends:",
      error
    );
    throw error;
  }
};

export default {
  getHealthMonitoring,
  updateHealthReading,
  getBloodPressureTrends,
};

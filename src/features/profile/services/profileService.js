/**
 * Profile Service
 * Handles profile-related API calls
 */

import { get } from "../../../shared/services/api";

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
    console.error("❌ [PROFILE SERVICE] Error fetching profile card stats:", error);
    throw error;
  }
};

export default {
  getProfileCardStats,
};


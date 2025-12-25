/**
 * Prescription Service
 * Handles prescription-related API calls
 */

import { get } from "../../../shared/services/api";

/**
 * Get all prescriptions for the current patient
 * @returns {Promise<object>} - Response with prescriptions data
 */
export const getPrescriptions = async () => {
  console.log("💊 [PRESCRIPTION SERVICE] Fetching prescriptions...");

  try {
    const response = await get("/prescription");

    console.log("✅ [PRESCRIPTION SERVICE] Prescriptions fetched successfully!");
    console.log("✅ [PRESCRIPTION SERVICE] Response:", JSON.stringify(response, null, 2));

    // Handle response format - response.data contains the array
    const prescriptions = response.data || [];
    console.log("✅ [PRESCRIPTION SERVICE] Prescriptions found:", prescriptions.length);

    return {
      success: true,
      data: prescriptions,
    };
  } catch (error) {
    console.error("❌ [PRESCRIPTION SERVICE] Error fetching prescriptions:", error);
    throw error;
  }
};

export default {
  getPrescriptions,
};


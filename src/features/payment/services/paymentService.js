/**
 * Payment Service
 * Handles payment-related API calls
 */

import { post, get } from "../../../shared/services/api";

/**
 * Initialize payment for a booking
 * @param {string} bookingId - The booking ID
 * @param {string} consultantId - The consultant ID
 * @returns {Promise<object>} - Response with payment initialization data
 */
export const initializePayment = async (bookingId, consultantId) => {
  console.log("💳 [PAYMENT SERVICE] Initializing payment...");
  console.log("💳 [PAYMENT SERVICE] Booking ID:", bookingId);
  console.log("💳 [PAYMENT SERVICE] Consultant ID:", consultantId);

  try {
    const response = await post("/payments/initialize/booking", {
      bookingId,
      consultantId,
    });

    console.log("✅ [PAYMENT SERVICE] Payment initialized successfully!");
    console.log("✅ [PAYMENT SERVICE] Response:", JSON.stringify(response, null, 2));

    return response;
  } catch (error) {
    console.error("❌ [PAYMENT SERVICE] Error initializing payment:", error);
    throw error;
  }
};

/**
 * Verify payment using reference
 * @param {string} reference - Payment reference
 * @returns {Promise<object>} - Response with payment verification data
 */
export const verifyPayment = async (reference) => {
  console.log("🔍 [PAYMENT SERVICE] Verifying payment...");
  console.log("🔍 [PAYMENT SERVICE] Reference:", reference);

  try {
    const response = await get(`/payments/verify/${reference}`);

    console.log("✅ [PAYMENT SERVICE] Payment verified successfully!");
    console.log("✅ [PAYMENT SERVICE] Response:", JSON.stringify(response, null, 2));

    return response;
  } catch (error) {
    console.error("❌ [PAYMENT SERVICE] Error verifying payment:", error);
    throw error;
  }
};

export default {
  initializePayment,
  verifyPayment,
};

